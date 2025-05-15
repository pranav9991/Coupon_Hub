from pymongo import MongoClient
from datetime import datetime, timezone
from bson import ObjectId

# MongoDB Atlas Connection String
MONGO_URI = "mongodb+srv://pranavparasar99:2003Pranav@couponhubcluster.xorwepq.mongodb.net/?retryWrites=true&w=majority&appName=CouponHubCluster"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["coupon_hub"]
coupons_collection = db["coupons"]

# Sample Coupons Data
sample_coupons = [
    {
        "category": "Food",
        "description": "Get 20% off on Pizza Hut orders above $20",
        "discount": "20%",
        "vendor": "Pizza Hut",
        "expiry": "2025-04-10",
        "is_redeemed": False,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "category": "Clothing",
        "description": "Flat 30% off on Adidas Sneakers",
        "discount": "30%",
        "vendor": "Adidas",
        "expiry": "2025-05-15",
        "is_redeemed": False,
        "created_at": datetime.now(timezone.utc)
    },
    {
        "category": "Electronics",
        "description": "Buy 1 Get 1 Free on Mobile Accessories",
        "discount": "BOGO",
        "vendor": "Amazon",
        "expiry": "2025-06-20",
        "is_redeemed": False,
        "created_at": datetime.now(timezone.utc)
    }
]

# Insert Data
result = coupons_collection.insert_many(sample_coupons)

print(f"Inserted {len(result.inserted_ids)} coupons successfully!")
