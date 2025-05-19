# 🏷️ Coupon-Hub Chatbot

**Coupon-Hub** is an AI-powered chatbot that helps users find relevant and active coupons based on their voice or text queries. It combines **Google's Gemini AI** for intelligent response generation, **MongoDB** for storing coupon data, **Flask** for backend APIs, and **Streamlit** for a sleek and interactive frontend.

---

## ✨ Features

- 🤖 **AI-Powered Coupon Matching**  
  Uses Google Gemini (via `gemini-2.0-flash`) to understand user needs and suggest relevant coupons.

- 🗂️ **MongoDB Integration**  
  Stores coupon details like description, discount, vendor, expiry, and redemption status.

- 🧠 **RAG-like Filtering**  
  Fetches unredeemed coupons from the database and matches them with user intent.

- 🔗 **RESTful Flask API**  
  Handles chat logic at the `/chatbot` endpoint.

- 💬 **Streamlit Chat UI**  
  An intuitive frontend chat interface built with Streamlit.

- 🔄 **CORS Support**  
  Seamless communication between frontend and backend across origins.

---

## 📦 Prerequisites

- Python 3.8+
- MongoDB Atlas account (or local MongoDB setup)
- Google API key for Gemini AI
- Git (optional, for cloning)

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/coupon-hub-chatbot.git
cd coupon-hub-chatbot
````

### 2. Set Up a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🔐 Configuration

Create a `.env` file in the root directory:

```
GOOGLE_API_KEY=your_google_api_key_here
```

> ⚠️ Replace `your_google_api_key_here` with your actual Google API key.

---

## 🛢️ MongoDB Setup

* **MongoDB Atlas**: Use your connection string in both `app2.py` and `db.py`
* **Local MongoDB**: Update `MONGO_URI` in both files to `mongodb://localhost:27017`

Then, populate the database:

```bash
python db.py
```

This seeds the `coupon_hub` database with sample coupon data.

---

## 🚀 Usage

### 1. Start the Flask Backend

```bash
python app2.py
```

> The server starts at [http://127.0.0.1:5000](http://127.0.0.1:5000)

### 2. Launch the Streamlit Frontend

Open a new terminal (in the same environment):

```bash
streamlit run streamlit_app.py
```

> This opens the app at [http://localhost:8501](http://localhost:8501)

### 3. Run index.js file if Using with Website or Webpart instead of Streamlit

---

## 💬 Interacting with the Chatbot

* Enter your query in the text field (e.g., *"Any deals on pizza?"*)
* The chatbot processes your request and returns:

  * 🏷️ Coupon description
  * 🛍️ Vendor
  * 💰 Discount
  * 📆 Expiry date
* Chat history is preserved via session state.

---

## 🧾 Database Schema

Collection: `coupons` in `coupon_hub` database

| Field         | Description                                              |
| ------------- | -------------------------------------------------------- |
| `category`    | Coupon category (e.g., Food, Fashion, Electronics)       |
| `description` | Description of the offer (e.g., "Get 20% off Pizza Hut") |
| `discount`    | Type of discount (e.g., "20%", "BOGO")                   |
| `vendor`      | Vendor name (e.g., Pizza Hut, Nike)                      |
| `expiry`      | Expiry date (e.g., `"2025-04-10"`)                       |
| `is_redeemed` | Redemption status (`False` for active)                   |
| `created_at`  | Timestamp of coupon creation                             |

---

## ⚠️ Notes

* Ensure consistency:

  * `app2.py` expects `is_redeemed = "on"`, while `db.py` uses `False`.
    👉 Update `app2.py` to check for `is_redeemed == False` if using `db.py`.

* The Flask app runs in **debug mode**. Disable for production:

  ```python
  app.run(debug=False)
  ```

* If deployed externally, **update `API_URL` in `streamlit_app.py`**

* Do **NOT** commit `.env` to version control. Add to `.gitignore`.

---

## 🧰 Troubleshooting

| Issue                       | Solution                                                                  |
| --------------------------- | ------------------------------------------------------------------------- |
| 🔌 MongoDB connection error | Check `MONGO_URI`, and whitelist your IP in MongoDB Atlas                 |
| ❌ Gemini API error          | Verify your Google API key and Gemini model access                        |
| 🧾 JSON decode issues       | Print or log `cleaned_reply` in `app2.py` to inspect unexpected responses |
| 🔒 CORS error               | Ensure `flask-cors` is installed and used in `app2.py`                    |

---

## 🙌 Contributing

We welcome contributions!
To get started:

bash
# Fork the repo, then:
git checkout -b feature/your-feature
# Make changes, then:
git commit -m "Add your feature"
git push origin feature/your-feature
# Open a pull request 🚀


---

## 🧑‍💻 Author

**Prannav Parasar**
📫 pranavparasar99@gmail.com

---

