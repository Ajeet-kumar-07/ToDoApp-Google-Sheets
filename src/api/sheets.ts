import axios, { AxiosRequestConfig } from "axios";

const apicoIntegrationId: string = "SM9HI3";
const spreadSheetId: string = "1eGskfTdNRXdlcqP3nqS76kr6HnNrRqfBOMLEz08pGdA";
const sheetName: string = "Sheet1"; // (or your actual tab name if different)
const sheetId: number = 0;
// you can look at the URL of your spread sheet in the browser to find the gid

const apiBaseUrl = `https://api.apico.dev/v1/${apicoIntegrationId}/${spreadSheetId}`;

export interface SpreadSheetResponse {
  values: string[][];
}
export const getSpreasheetData = async () => {
  const response = await axios.get<SpreadSheetResponse>(
    `${apiBaseUrl}/values/${sheetName}`
  );
  return response.data;
};

/**
 * Function to append data to the spreadsheet
 * @param data string[]
 * @returns
 */
export const appendSpreadsheetData = async (
  data: (string | number | boolean)[]
) => {
  const options: AxiosRequestConfig = {
    method: "POST",
    url: `${apiBaseUrl}/values/${sheetName}:append`,
    params: {
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      includeValuesInResponse: true,
    },
    data: {
      values: [data],
    },
  };
  const response = await axios(options);
  return response.data;
};

export const updateSpreadsheetData = async (
  index: number,
  values: (string | number | boolean)[]
) => {
  const options: AxiosRequestConfig = {
    method: "PUT",
    url: `${apiBaseUrl}/values/${sheetName}!A${index + 1}:C${index + 1}`,
    params: {
      valueInputOption: "USER_ENTERED",
      includeValuesInResponse: true,
    },
    data: {
      values: [values],
    },
  };
  const response = await axios(options);
  return response.data;
};

export const deleteSpreadsheetRow = async (index: number) => {
  const range = {
    sheetId: sheetId,
    dimension: "ROWS",
    startIndex: index,
    endIndex: index+1,
  };
  console.log(`deleting row from ${range.startIndex} to ${range.endIndex}`)
  const options: AxiosRequestConfig = {
    method: "POST",
    url: `${apiBaseUrl}:batchUpdate`,
    data: {
      requests: [
        {
          deleteDimension: {
            range,
          },
        },
      ],
    },
  };

  const response = await axios(options);
  return response.data;
};

export const parseTodoWithAI = async (input: string) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not set');
  const prompt = `Extract the task, due date, priority, and tags from this todo: "${input}"\nRespond as JSON: { "task": "...", "dueDate": "...", "priority": "...", "tags": ["..."] }`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts structured todo data from natural language.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.2
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  // Extract JSON from the response
  const text = response.data.choices[0].message.content;
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Failed to parse AI response: ' + text);
  }
};

export const parseTodoWithGemini = async (input: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not set');
  const prompt = `Extract the task, due date, priority, and tags from this todo: "${input}"\nRespond as JSON: { "task": "...", "dueDate": "...", "priority": "...", "tags": ["..."] }`;
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  // Extract JSON from the response
  const text = response.data.candidates[0].content.parts[0].text;
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Failed to parse Gemini response: ' + text);
  }
};
