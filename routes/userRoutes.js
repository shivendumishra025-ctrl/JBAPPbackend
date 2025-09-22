const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// ➤ Create User
router.post("/", async (req, res) => {
 try {
  console.log(req.body);
    const { fullName, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      phone,
      passwordHash,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
   console.log(err)
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ➤ Get All Users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➤ Get Single User
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➤ Update User
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ➤ Delete User
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/api/address/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, houseNo, street, city, state, pincode } = req.body;

    const newAddress = {
      name,
      phone,
      houseNo,
      street,
      city,
      state,
      zip: pincode,
      country: "India", // default or pass dynamically
    };

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.push(newAddress);
    await user.save();

    res.json({ message: "Address added successfully", addresses: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✏️ Update an existing address
 * @route PUT /api/address/:userId/:addressId
 */
router.put("/api/address/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    console.log(req.body);
    const {  name , phone, houseNo,street, city, state, zip, country } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    address.name = name || address.name;
    address.phone = phone || address.phone;
    address.houseNo = houseNo || address.houseNo;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zip = zip || address.zip;
    address.country = country || address.country;

    await user.save();

    res.json({ message: "Address updated successfully", addresses: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 🗑 Delete address
 * @route DELETE /api/address/:userId/:addressId
 */
router.delete("/api/address/:userId/:addressId", async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    address.deleteOne();
    await user.save();

    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch data
// 📌 Get all addresses of a user
router.get("/address/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("user id", userId);
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Return saved addresses
    res.json({ addresses: user.addresses });
  } catch (error) {
    console.log("❌ Error fetching addresses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;





