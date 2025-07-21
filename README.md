# ToDo App with Google Sheets (Apico Integration)

A beautiful, animated, and minimalist Todo app that syncs with Google Sheets using Apico.

---

## ✨ Features
- **Google Sheets as backend** (via Apico)
- **Add, complete, edit, and delete todos**
- **Inline editing** with animated transitions
- **Minimalist icons** for due date, priority, and tags
- **Subtle, modern animations** for all actions (add, remove, complete, edit)
- **Contextual actions** (edit/delete only on hover)
- **Responsive and clean UI**

---

## 🚀 Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/Ajeet-kumar-07/ToDoApp-Google-Sheets.git
cd ToDoApp-Google-Sheets
```

### 2. Install dependencies
```sh
npm install
```

### 3. Create a Google Sheet & Apico Integration
- Go to [Google Sheets](https://sheets.google.com) and create a new sheet.
- Go to [Apico](https://apico.dev) and create a new Google Sheets integration.
- **Note your integration ID** (e.g., `SM9HI3`).
- **Share your Google Sheet** with the Apico service account email (see Apico dashboard for the email) as an **Editor**.

### 4. Configure your app
Edit `src/api/sheets.ts` and set:
```ts
const apicoIntegrationId: string = "<Your Apico integration id>";
const spreadSheetId: string = "<Your Google sheet id>";
const sheetName: string = "Sheet1"; // Must match your tab name exactly
const sheetId: number = <Your sheet/page gid>; // From the URL (gid=...)
```

### 5. Run the app
```sh
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Troubleshooting
- **403 Forbidden errors?**
  - Make sure your Google Sheet is shared with the Apico service account (Editor access).
  - Double-check your integration ID, sheet ID, and sheet name.
  - Wait a few minutes after sharing for permissions to propagate.
- **Edits not syncing?**
  - Ensure you are using the latest code (inline editing now syncs with Google Sheets).
- **Animations not working?**
  - Make sure your browser supports modern CSS and JavaScript.

---

## 📸 Screenshots
![Animated Todo App](https://github.com/Ajeet-kumar-07/ToDoApp-Google-Sheets/blob/main/src/assets/Screenshot%202025-06-18%20112836.png?raw=true)

---

## 📚 Credits
- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Apico](https://apico.dev), and [Google Sheets](https://sheets.google.com)
- Animations and UI inspired by modern productivity tools

---

## License
MIT
