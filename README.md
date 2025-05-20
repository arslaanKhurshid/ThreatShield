# 🛡️ ThreatShield

**ThreatShield** is an intelligent threat detection system powered by a Large Language Model (LLM) to analyze real-time logs for potential security threats. It leverages advanced AI to detect and respond to suspicious activities, with a robust backend built in Python and an interactive frontend developed using Angular.

## 🧠 Core Features

- ✅ **Real-Time Log Ingestion**: Processes logs applications in real time.
- ✅ **AI-Powered Threat Detection**: Utilizes the Groq API for intelligent threat identification.
- ✅ **Dynamic Rule Generation**: Automatically generates rules based on detected patterns.
- ✅ **Intuitive Dashboard**: Angular-based frontend for a seamless user experience.
- ✅ **Secure Configuration**: Uses `.env` files for secure environment setup.

## 🏗️ Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| **Frontend** | Angular                       |
| **Backend**  | Python (FastAPI / Flask)      |
| **LLM**      | Groq API                      |
| **Log Source** | Real-time logs (servers, apps) |



## ⚙️ Setup Guide

## Backend Setup

#### 1️⃣ Prerequisites
- Python 3.10 or higher
- Virtualenv (recommended)
- Groq API Key (obtain from Groq)

#### 2️⃣ Clone the Repository
```
git clone https://github.com/arslaanKhurshid/ThreatShield.git
cd ThreatShield/backend
```
#### 3️⃣ Create and Activate Virtual Environment
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
#### 4️⃣ Install Dependencies
```
pip install -r requirements.txt
```
#### 5️⃣ Configure Environment Variables
- Create a .env file in the backend/ folder with the following content:
```
GROQ_API_KEY=your_groq_api_key_here
```
#### 6️⃣ Run the Backend Server
```
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
## Frontend Setup Guide

#### 1️⃣ Navigate to Angular App Directory
```
cd ../frontend
```

#### 2️⃣ Install Node Modules
```
npm install
```
#### 3️⃣ Run Angular App
```
ng serve

```
- The frontend will be available at http://localhost:4200.
