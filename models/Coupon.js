const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true }, // e.g. BENGAL20
    description: { type: String },

    discountType: {
      type: String,
      enum: ["Percentage", "Flat"], // percentage (e.g. 20%) or flat (e.g. ₹50)
      required: true,
    },
    discountValue: { type: Number, required: true },

    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
