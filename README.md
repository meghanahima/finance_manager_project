## 🚀 Run This Project Locally

This project includes a **frontend (React)** and **backend (Node.js + Express)**. It uses:

- 🌐 **Azure Blob Storage** for receipt uploads  
- 🧠 **OpenAI API** *(temporarily integrated)* for analyzing receipts  
- 🗃️ **MongoDB** for storing user data and transactions  

---

### 📁 1. Clone the Repository

```bash
git clone https://github.com/meghanahima/finance_manager_project.git
cd finance_manager_project
```

---

### 📦 2. Install Dependencies

Open two terminals.

**Terminal 1 – Backend**

```bash
cd backend
npm install
```

**Terminal 2 – Frontend**

```bash
cd frontend
npm install
```

---

### ▶️ 3. Start the Project

**Terminal 1 – Start Backend**

```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

**Terminal 2 – Start Frontend**

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173** 
(or another available ports)

---

### ⚠️ Note

This project currently includes **temporary credentials** for:

- **Azure Blob Storage**
- **MongoDB**
- **OpenAI API**

> 🔐 These are for demo/testing purposes only.  
> Before deploying or using this project in production, **create your own secure credentials**.
