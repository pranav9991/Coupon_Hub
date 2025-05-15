from flask import Flask, request, jsonify
from flask_cors import CORS 
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Connect to MongoDB
MONGO_URI = "mongodb+srv://pranavparasar99:<db_password>@couponhubcluster.xorwepq.mongodb.net/?retryWrites=true&w=majority&appName=CouponHubCluster"
client = MongoClient(MONGO_URI)
db = client["coupon_hub"]

# Define Coupon Functions
def recommend_coupons(category: str):
    coupons = db.coupons.find({"category": category, "is_redeemed": False})
    result = [{"id": str(c["_id"]), "description": c["description"], "discount": c["discount"],
               "vendor": c["vendor"], "expiry": c["expiry"]} for c in coupons]
    return result if result else "No coupons available for this category."

def redeem_coupon(coupon_id: str, user_id: str):
    result = db.coupons.update_one({"_id": ObjectId(coupon_id)}, {"$set": {"is_redeemed": True}})
    if result.modified_count == 0:
        return "Coupon not found or already redeemed."
    
    db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"redeemed_coupons": 1}})
    db.coupon_transactions.insert_one({
                "coupon_id": coupon_id,
                "user_id": user_id,
                "transaction_type": "redeem",
                "timestamp": datetime.now(timezone.utc)})
    return "Coupon redeemed successfully!"

def share_coupon(category: str, description: str, discount: str, expiry: str, vendor: str, user_id: str):
    db.coupons.insert_one({
        "category": category,
        "description": description,
        "discount": discount,
        "expiry": expiry,
        "vendor": vendor,
        "is_redeemed": False,
        "shared_by": user_id,
        "created_at": datetime.now(timezone.utc)  
    })
    return "Coupon shared successfully!"

# Flask Route for Chatbot
@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    user_input = data.get("message", "")

    if not user_input:
        return jsonify({"error": "Message is required"}), 400

    try:
        response = model.generate_content(user_input)
        bot_reply = response.text if hasattr(response, "text") else "Sorry, I couldn't process that request."
    except Exception as e:
        bot_reply = f"Error: {str(e)}"

    return jsonify({"response": bot_reply})

# Run Flask Server
if __name__ == "__main__":
    app.run(debug=True)
