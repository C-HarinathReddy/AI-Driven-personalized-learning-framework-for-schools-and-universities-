# Setup Instructions

Follow the steps below to run the project locally.

---

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AI-Learning-System.git
cd AI-Learning-System
```

---

## 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

### Windows
```bash
venv\Scripts\activate
```

### Mac / Linux
```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

Backend server will run at:

```
http://127.0.0.1:8000
```

---

## 3. Frontend Setup

Open a **new terminal window**.

Navigate to the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

Frontend will run at:

```
http://localhost:3000
```

---

## 4. Access the Application

Open your browser and go to:

```
http://localhost:3000
```

Login using the appropriate credentials for:

- Admin
- Teacher
- Student

---

## Environment Requirements

- Python 3.9+
- Node.js 18+
- SQLite (default Django database)
- npm (comes with Node.js)

---
