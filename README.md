# 🌾 MGNREGA District Dashboard

> A simple, interactive web dashboard that helps visualize how much employment has been generated under the **Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)** across different districts in India.

Built with ❤️ to make government data easier for everyone — from researchers to rural citizens — to understand and explore.

---

## 🚀 What This Dashboard Does

- 📍 **Auto-detects your district** using GPS and OpenStreetMap APIs.  
- 📊 **Shows MGNREGA performance data** such as persondays generated, households worked, and average days of employment.  
- 🔄 **Supports multiple chart types:** Bar, Line, Pie, Doughnut, Radar, and Polar Area.  
- 💬 **Explains insights in plain words** for better understanding by local users.  
- 🔗 **Uses live open data** from the official **data.gov.in** MGNREGA API.

---

## 🛠️ Tech Stack

| Purpose | Technology |
|----------|-------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Charts** | Chart.js |
| **Data Source** | data.gov.in (MGNREGA API) |
| **Geolocation** | OpenStreetMap (Nominatim API) |
| **Hosting Options** | Vercel / Render / GitHub Pages |

---

## 🗂️ Project Structure

📂 MGNREGA-Dashboard
├── index.html → Home / Welcome page
├── dashboard.html → Main visualization dashboard
├── style.css → Styling and layout
├── script.js → Core logic (API, charts, geolocation)
├── README.md → Project documentation
└── requirements.txt → (Optional) dependencies


---

## ⚙️ How to Run Locally

1. **Clone this repository** 
   ```bash
   git clone https://github.com/<your-username>/MGNREGA-Dashboard.git
   cd MGNREGA-Dashboard

2. Start a local server

Option 1 (Python):

python3 -m http.server 8080


Option 2 (Node.js):

npx http-server -p 8080