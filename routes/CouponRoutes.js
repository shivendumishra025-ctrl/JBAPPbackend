const express = require("express");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const router = express.Router();

// ✅ 1. Create Coupon (Admin)
router.post("/", async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ 2. Fetch All Active Coupons
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
    });
    res.json(coupons);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ 3. Apply Coupon to Order (Customer)
router.post("/apply", async (req, res) => {
  try {
    const { orderId, code } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ error: "Coupon not found or inactive" });

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return res.status(400).json({ error: "Coupon is expired or not yet valid" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // ✅ Calculate discount
    let discount = 0;
    if (coupon.discountType === "Percentage") {
      discount = (order.subTotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    // ✅ Ensure discount does not exceed subtotal
    discount = Math.min(discount, order.subTotal);

    // ✅ Recalculate order totals
    order.discount = discount;
    const gst = order.subTotal * 0.05; // same GST rate
    order.gst = gst;
    order.grandTotal = order.subTotal - discount + gst;

    await order.save();
    res.json({ message: "Coupon applied successfully", order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
