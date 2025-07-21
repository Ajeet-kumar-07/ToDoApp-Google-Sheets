import React, { useEffect, useState, FormEvent } from 'react';
import "./App.css";
import {
  appendSpreadsheetData,
  deleteSpreadsheetRow,
  getSpreasheetData,
  updateSpreadsheetData,
} from "./api/sheets";
import { FaCalendarAlt, FaFlag, FaTag, FaEdit, FaTrash } from 'react-icons/fa';

interface Todo {
  id: number; // Unique identifier for the todo within the list
  value: string; // Text content of the todo
  isCompleted: boolean; // Flag indicating if the todo is completed
}

function App() {
  // to store the todos in state
  const [todos, setTodos] = useState<Todo[]>([]);
  // to store the current todo input value in state
  const [todo, setTodo] = useState<string>("");
  // Add a state to track which todo is hovered
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [dueDates, setDueDates] = useState<{ [id: number]: string }>({});
  const [priorities, setPriorities] = useState<{ [id: number]: 'None' | 'Low' | 'Medium' | 'High' }>({});
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  // load the todos from the spreadsheet when the app loads
  const loadTodos = async () => {
    // load the todos from the spreadsheet
    const response = await getSpreasheetData();
    if (!response.values) {
      console.error('No values returned from Google Sheets:', response);
    }
    const todos = (response.values || []).map((t: string[]) => ({
      id: parseInt(t[0]),
      value: t[1],
      isCompleted: t[2] === "TRUE",
    }));
    setTodos(todos);
  };

  useEffect(() => {
    console.log(`Loading todos...`);
    loadTodos();
  }, []);

  // function to add a todo to the list
  const addTodo = (todo: string) => {
    // if the todo is empty, don't add it to the list
    if (!todo.trim()) return;
    // store the todo in state
    const todoToAdd: Todo = {
      id: Date.now(),
      value: todo.trim(),
      isCompleted: false,
    };

    setTodos((prev) => [...prev, todoToAdd]);
    // clear the todo input value
    setTodo("");
    // store it in the spreadsheet
    appendSpreadsheetData([
      todoToAdd.id,
      todoToAdd.value,
      todoToAdd.isCompleted.toString(),
    ]);
  };

  // function to remove a todo from the list
  const removeTodo = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      setTodos((prev) =>
        prev.filter((p, index) => {
          if (p.id === id) {
            deleteSpreadsheetRow(index);
            return false;
          } else return true;
        })
      );
      setRemovingId(null);
    }, 300); // match CSS .removing transition
  };

  // function to toggle the isCompleted flag of a todo
  const toggleTodo = (id: number) => {
    // toggle the isCompleted flag of the todo
    console.log(`toggling todo with id: ${id}`);
    setTodos((prev) =>
      prev.map((p, index) => {
        if (p.id === id) {
          const updatedTodo = { ...p, isCompleted: !p.isCompleted };
          updateSpreadsheetData(index, [
            updatedTodo.id,
            updatedTodo.value,
            updatedTodo.isCompleted.toString(),
          ]);
          return updatedTodo;
        } else {
          return p;
        }
      })
    );
  };

  const handleDueDateChange = (id: number, date: string) => {
    setDueDates(prev => ({ ...prev, [id]: date }));
  };
  const handlePriorityCycle = (id: number) => {
    setPriorities(prev => {
      const order: ('None' | 'Low' | 'Medium' | 'High')[] = ['None', 'Low', 'Medium', 'High'];
      const current = prev[id] || 'None';
      const next = order[(order.indexOf(current) + 1) % order.length];
      return { ...prev, [id]: next };
    });
  };

  const startEdit = (id: number, value: string) => {
    setEditingId(id);
    setEditingValue(value);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };
  const saveEdit = async (id: number) => {
    let idx = -1;
    setTodos((prev) =>
      prev.map((t, i) => {
        if (t.id === id) {
          idx = i;
          return { ...t, value: editingValue };
        }
        return t;
      })
    );
    setEditingId(null);
    setEditingValue("");
    if (idx !== -1) {
      try {
        await updateSpreadsheetData(idx, [
          todos[idx].id,
          editingValue,
          todos[idx].isCompleted.toString(),
        ]);
        await loadTodos();
      } catch (err) {
        console.error('Failed to update Google Sheet:', err);
      }
    }
  };

  return (
    <div className="container">
      {/* Header with just the title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="title">Todos</h1>
      </div>
      {/* Input Area to add new todos */}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          addTodo(todo);
        }}
      >
        <input
          className="todo-input"
          type="text"
          name="todo"
          placeholder="Add a todo"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
          autoFocus
        />
        <button className="submit-btn" type="submit">
          Add
        </button>
      </form>
      {/* Area to render the todos */}
      <ul className="todos">
        {todos.map((t) => (
          <li
            key={t.id}
            onMouseEnter={() => setHoveredId(t.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            className={
              t.isCompleted
                ? 'completed' + (removingId === t.id ? ' removing' : '')
                : removingId === t.id
                ? 'removing'
                : ''
            }
          >
            <input
              type="checkbox"
              checked={t.isCompleted}
              onChange={() => {
                toggleTodo(t.id);
              }}
            />
            {editingId === t.id ? (
              <>
                <input
                  className="todo-input"
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  style={{ marginLeft: 8, width: 140, animation: 'fadeInSlide 0.5s' }}
                  autoFocus
                />
                <button className="submit-btn" style={{ marginLeft: 8, width: 36, animation: 'pulse 0.7s' }} title="Save" onClick={() => saveEdit(t.id)}>✔</button>
                <button className="delete-btn" style={{ marginLeft: 4, width: 36, animation: 'pulse 0.7s' }} title="Cancel" onClick={cancelEdit}>✖</button>
              </>
            ) : (
              <span className="todo" style={{ marginLeft: 8 }}>{t.value}</span>
            )}
            {/* Minimalist icons with tooltips and actions */}
            <span title="Due date" style={{ marginLeft: 8, color: '#888', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
              <FaCalendarAlt size={16} onClick={() => document.getElementById(`duedate-input-${t.id}`)?.focus()} />
              <input
                id={`duedate-input-${t.id}`}
                type="date"
                value={dueDates[t.id] || ""}
                onChange={e => handleDueDateChange(t.id, e.target.value)}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 24,
                  zIndex: 2,
                  display: hoveredId === t.id ? 'block' : 'none',
                  width: 120,
                  fontSize: 12,
                  animation: hoveredId === t.id ? 'fadeInSlide 0.5s' : undefined
                }}
              />
              {dueDates[t.id] && (
                <span style={{ marginLeft: 4, fontSize: '0.8em', color: '#007bff', background: '#e3f0ff', borderRadius: 8, padding: '1px 6px', transition: 'background 0.3s' }}>{dueDates[t.id]}</span>
              )}
            </span>
            <span
              title="Priority"
              style={{ marginLeft: 8, color: priorities[t.id] === 'High' ? '#dc3545' : priorities[t.id] === 'Medium' ? '#fd7e14' : priorities[t.id] === 'Low' ? '#28a745' : '#888', cursor: 'pointer', userSelect: 'none', transition: 'background 0.3s' }}
              onClick={() => handlePriorityCycle(t.id)}
            >
              <FaFlag size={16} />
              {priorities[t.id] && priorities[t.id] !== 'None' && (
                <span style={{ marginLeft: 4, fontSize: '0.8em', color: 'inherit', background: '#f3f3f3', borderRadius: 8, padding: '1px 6px', transition: 'background 0.3s' }}>{priorities[t.id]}</span>
              )}
            </span>
            <span title="Tag" style={{ marginLeft: 8, color: '#888', cursor: 'pointer' }}><FaTag size={16} /></span>
            {/* Contextual actions: show only on hover */}
            {hoveredId === t.id && editingId !== t.id && (
              <>
                <button
                  type="button"
                  className="submit-btn"
                  style={{ marginLeft: 8, width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, animation: 'pulse 0.7s' }}
                  title="Edit"
                  onClick={() => startEdit(t.id, t.value)}
                >
                  <FaEdit size={16} />
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  style={{ marginLeft: 4, width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, animation: 'pulse 0.7s' }}
                  title="Delete"
                  onClick={(e) => {
                    e.preventDefault();
                    removeTodo(t.id);
                  }}
                >
                  <FaTrash size={16} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
