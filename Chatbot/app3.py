

from flask import Flask, request, jsonify
from flask_cors import CORS 
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import re

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Connect to MongoDB
MONGO_URI = "mongodb+srv://aj417650:crK2wj9mSv7tYnix@cluster0.wxwa6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["coupon_hub"]

# Step 1: Fetch all non-redeemed coupon descriptions and IDs
def get_all_coupons():
    coupons = db.couponlistings.find({"is_redeemed": "on"}, {"_id": 1, "description": 1})       
    return [{"id": str(c["_id"]), "description": c["description"]} for c in coupons]

# Step 2: Fetch full details of selected coupon
def get_coupon_details(coupon_id):
    coupon = db.couponlistings.find_one({"_id": ObjectId(coupon_id)})
    if coupon:
        coupon["_id"] = str(coupon["_id"])
        return coupon
    return None

# Flask Route for Chatbot
@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    user_input = data.get("message", "")

    if not user_input:
        return jsonify({"error": "Message is required"}), 400

    # Step 1: Get only descriptions and IDs
    coupons = get_all_coupons()
    prompt = f"""
    User Input: {user_input}
    Available Coupons: {coupons}
    Which coupon is most suitable for the user? Return only the coupon ID in JSON format.
    Example Response: {{"id": "65f7e6b3aefc1a001c654321"}}
    """

    try:
        response = model.generate_content(prompt)
        # print("Raw response:", response)
        
        bot_reply = response.text if hasattr(response, "text") else None
        print("Bot reply:", bot_reply)
        
        if bot_reply:
            # Step 2: Clean the response to extract JSON
            # Remove markdown code block markers (```json, ```) and extra whitespace
            cleaned_reply = re.sub(r'^```json\s*|\s*```$', '', bot_reply, flags=re.MULTILINE).strip()
            # print("Cleaned reply:", cleaned_reply)

            # Parse the cleaned JSON response
            try:
                coupon_data = json.loads(cleaned_reply)
                print("Parsed coupon data:", coupon_data)
                coupon_id = coupon_data.get("id")
                print("Coupon ID:", coupon_id)

                if not coupon_id:
                    return jsonify({"error": "No coupon ID found in response"}), 400

                # Step 3: Fetch coupon details
                selected_coupon = get_coupon_details(coupon_id)
                if selected_coupon:
                    return jsonify({"response": selected_coupon})
                else:
                    return jsonify({"error": "Coupon not found"}), 404
            except json.JSONDecodeError as e:
                print("JSON parsing error:", str(e))
                return jsonify({"error": "Invalid JSON format in Gemini response"}), 500
        else:
            return jsonify({"response": "Sorry, I couldn't process that request."})

    except Exception as e:
        print("General error:", str(e))
        return jsonify({"error": str(e)}), 500

# Run Flask Server
if __name__ == "__main__":
    app.run(debug=True)