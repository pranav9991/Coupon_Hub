# Coupon-Hub Chatbot
Overview
Coupon-Hub is an AI-powered chatbot designed to help users find relevant coupons based on their queries. It leverages the Gemini AI model for natural language processing, MongoDB for coupon storage, Flask for the backend API, and Streamlit for the frontend interface. The chatbot fetches non-redeemed coupons from a MongoDB database, matches them to user input, and returns the most suitable coupon details.
Features

AI-Powered Coupon Matching: Uses Google's Gemini AI to analyze user queries and recommend relevant coupons.
MongoDB Integration: Stores and retrieves coupon data, including descriptions, discounts, vendors, and expiry dates.
Flask Backend: Provides a RESTful API endpoint (/chatbot) for processing user queries.
Streamlit Frontend: Offers a user-friendly chat interface to interact with the chatbot.
CORS Support: Enables cross-origin requests for flexible frontend-backend communication.

Prerequisites

Python 3.8 or higher
MongoDB Atlas account (or local MongoDB instance)
Google API key for Gemini AI
Git (optional, for cloning the repository)

Installation
1. Clone the Repository
git clone https://github.com/your-username/coupon-hub-chatbot.git
cd coupon-hub-chatbot

2. Set Up a Virtual Environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Install Dependencies
Install the required Python packages listed in requirements.txt:
pip install -r requirements.txt

4. Configure Environment Variables
Create a .env file in the project root and add your Google API key:
GOOGLE_API_KEY=your_google_api_key_here

Replace your_google_api_key_here with your actual Google API key for Gemini AI.
5. Set Up MongoDB

MongoDB Atlas: Use the provided MongoDB URI in app2.py and db.py (or replace with your own).
Local MongoDB: Update the MONGO_URI in app2.py and db.py to point to your local MongoDB instance (e.g., mongodb://localhost:27017).
Run db.py to populate the coupon_hub database with sample coupon data:python db.py



Usage
1. Start the Flask Backend
Run the Flask server to handle chatbot API requests:
python app2.py

The server will start at http://127.0.0.1:5000 by default.
2. Launch the Streamlit Frontend
In a separate terminal, activate the virtual environment and run the Streamlit app:
streamlit run streamlit_app.py

The Streamlit interface will open in your default browser (typically at http://localhost:8501).
3. Interact with the Chatbot

Enter a query in the chat input field (e.g., "I want a discount on pizza").
The chatbot will respond with a list of relevant coupons (if any) or a message indicating no matches.
Chat history is preserved during the session via Streamlit's session state.


Database Schema
The coupon_hub database contains a coupons collection with the following fields:

category: Coupon category (e.g., Food, Clothing, Electronics)
description: Coupon description (e.g., "Get 20% off on Pizza Hut orders above $20")
discount: Discount value (e.g., "20%", "BOGO")
vendor: Vendor name (e.g., Pizza Hut, Adidas)
expiry: Expiry date (e.g., "2025-04-10")
is_redeemed: Redemption status (boolean or string "on"/"off")
created_at: Creation timestamp

Notes

The is_redeemed field in app2.py checks for a string value "on", while db.py uses a boolean False. Ensure consistency in your database (update app2.py to check is_redeemed: False if using db.py as-is).
The Flask server runs in debug mode by default. Disable debug mode (app.run(debug=False)) for production.
Update the API_URL in streamlit_app.py if deploying the Flask backend to a different host/port.
Secure your MongoDB credentials and Google API key by excluding .env from version control (add to .gitignore).

Troubleshooting

MongoDB Connection Issues: Verify your MONGO_URI and ensure your IP is whitelisted in MongoDB Atlas.
Gemini API Errors: Check your Google API key and ensure the Gemini model (gemini-2.0-flash) is accessible.
JSON Parsing Errors: If the Gemini response format is inconsistent, inspect the cleaned_reply in app2.py logs.
CORS Errors: Ensure flask-cors is installed and configured correctly.

Contributing
Contributions are welcome! Please:

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m 'Add your feature').
Push to the branch (git push origin feature/your-feature).
Open a pull request.


