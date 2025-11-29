// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/register', async (req, res) => {
  const { name = '', email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });
  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    user = new User({ name, email: email.toLowerCase(), password: hashed });
    await user.save();
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ msg: 'If that account exists, a reset link was sent.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600 * 1000;
    await user.save();
    const frontend = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
    const resetLink = `${frontend}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
    const mail = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: 'InventoryPro Password Reset',
      html: `<p>Click this link to reset your password (expires in 1 hour):</p>
             <p><a href="${resetLink}">${resetLink}</a></p>`
    };
    await transporter.sendMail(mail);
    res.json({ msg: 'If that account exists, a reset link was sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/reset', async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) return res.status(400).json({ msg: 'Missing data' });
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'InventoryPro — Password changed',
        text: 'Your password was changed. If you did not request this, contact support.'
      });
    } catch (e) {
      console.warn('Failed to send confirmation email', e.message);
    }
    res.json({ msg: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
