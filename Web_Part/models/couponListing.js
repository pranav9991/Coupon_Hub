const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const couponSchema=new Schema({

    code:String,
    organizationName: String,
    category: String,
    Title: String,
    discount:String,
    price:Number,
    expiry:Date,
    image:String,
    description:String,
    is_redeemed:String,

    
});
const CouponListing=mongoose.model("CouponListing",couponSchema);
module.exports=CouponListing;
