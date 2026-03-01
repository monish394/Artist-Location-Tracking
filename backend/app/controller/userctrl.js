// controllers/userCtrl.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import Artist from '../model/Artist.js';
import Fan from '../model/Fan.js';
import { registerSchema, loginSchema } from "../validator/userValidation.js"

const userCtrl = {};

// ========== REGISTER ==========
userCtrl.register = async (req, res) => {
  try {
    // 1) Joi validation
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,   // collect all errors
      stripUnknown: true,  // remove extra fields
    });

    if (error) {
      // You can send all validation errors:
      const errors = error.details.map(d => d.message);
      return res.status(400).json({
        msg: 'Validation error',
        errors,
      });
    }

    // 2) Extract validated data
    const {
      email,
      password,
      role,
      artistName,
      stageName,
      bio,
      genre,
      city,
      state,
      firstName,
      lastName,
      dateOfBirth,
    } = value;

    // 3) Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: 'User already exists with this email' });
    }

    // 4) Create base user and hash password
    const user = new User({ email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 5) Create profile based on role
    if (role === 'artist') {
      const artist = new Artist({
        user: user._id,
        artistName,
        stageName: stageName || '',
        bio: bio || '',
        genre: genre ? [genre] : [],
        location: {
          city: city || '',
          state: state || '',
        },
      });

      await artist.save();
      user.artistProfile = artist._id;
    }

    if (role === 'fan') {
      const fan = new Fan({
        user: user._id,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || null,
        location: {
          city: city || '',
          state: state || '',
        },
      });

      await fan.save();
      user.fanProfile = fan._id;
    }

    // 6) Save user
    await user.save();

    // 7) Create JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res
        .status(500)
        .json({ msg: 'Server misconfiguration. Please contact support.' });
    }

    const token = jwt.sign(
      { user: { id: user._id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      msg: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    // LOG FULL ERROR, NOT JUST message
    console.error('Register error:', err);
    // For development, send the message so you see *why* it's 500
    return res.status(500).json({ msg: err.message || 'Server error' });
  }
};

// ========== LOGIN ==========
userCtrl.login = async (req, res) => {
  try {
    // 1) Validate with Joi
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const msg = error.details[0]?.message || 'Invalid data';
      return res.status(400).json({ msg });
    }

    const { email, password } = value;

    // 2) Find user
    const user = await User.findOne({ email })
      .populate('artistProfile')
      .populate('fanProfile');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ msg: 'Account is deactivated' });
    }

    // 3) Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // 4) Update last login (optional)
    user.lastLogin = Date.now();
    await user.save();

    // 5) JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res
        .status(500)
        .json({ msg: 'Server misconfiguration. Please contact support.' });
    }

    const token = jwt.sign(
      { user: { id: user._id, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    let profile = null;
    if (user.role === 'artist') profile = user.artistProfile;
    if (user.role === 'fan') profile = user.fanProfile;

    return res.json({
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

userCtrl.profile = async (req, res) => {
  try {
    const user = await User.findById(req.userid)
      .select("-password")
      .populate("artistProfile")
      .populate("fanProfile");

    res.json({
      user,
    });
  } catch (err) {
    console.error("Profile error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


export default userCtrl;