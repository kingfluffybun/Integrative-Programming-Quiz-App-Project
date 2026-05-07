const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendOTP = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('recovery', {
                title: 'Recovery - Express Quiz App',
                message: null,
                errors: errors.array(),
                data: req.body,
                step: 1
            });
        }

        const { email } = req.body;

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.render('recovery', {
                title: 'Recovery - Express Quiz App',
                message: null,
                errors: [{ msg: 'No account found with that email' }],
                data: req.body,
                step: 1
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP in database
        await db.query(
            'INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)',
            [email, otp, expiresAt]
        );

        // Send email
        const mailOptions = {
            from: `"Quiz App Support" <${process.env.MAIL_USER}>`,
            to: email,
            subject: 'Password Recovery OTP',
            text: `Your OTP for password recovery is ${otp}. It will expire in 10 minutes.`,
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333;">Password Recovery</h2>
                <p>Your OTP for password recovery is:</p>
                <h1 style="color: #4A90E2; font-size: 40px; letter-spacing: 5px;">${otp}</h1>
                <p>It will expire in 10 minutes.</p>
            </div>`
        };

        await transporter.sendMail(mailOptions);

        res.render('recovery', {
            title: 'Recovery - Express Quiz App',
            message: 'OTP has been sent to your email.',
            errors: [],
            data: { email },
            step: 2
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).render('recovery', {
            title: 'Recovery - Express Quiz App',
            message: null,
            errors: [{ msg: 'Server error during OTP request' }],
            data: req.body,
            step: 1
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [rows] = await db.query(
            'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp]
        );

        if (rows.length === 0) {
            return res.render('recovery', {
                title: 'Recovery - Express Quiz App',
                message: null,
                errors: [{ msg: 'Invalid or expired OTP' }],
                data: { email },
                step: 2
            });
        }

        res.render('recovery', {
            title: 'Recovery - Express Quiz App',
            message: 'OTP verified. You can now change your password.',
            errors: [],
            data: { email, otp },
            step: 3
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).render('recovery', {
            title: 'Recovery - Express Quiz App',
            message: null,
            errors: [{ msg: 'Server error during OTP verification' }],
            data: req.body,
            step: 2
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('recovery', {
                title: 'Recovery - Express Quiz App',
                message: null,
                errors: errors.array(),
                data: req.body,
                step: 3
            });
        }

        const { email, otp, password } = req.body;

        // Verify OTP again to be safe
        const [rows] = await db.query(
            'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp]
        );

        if (rows.length === 0) {
            return res.render('recovery', {
                title: 'Recovery - Express Quiz App',
                message: null,
                errors: [{ msg: 'Session expired. Please start over.' }],
                data: {},
                step: 1
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        // Delete OTPs for this email
        await db.query('DELETE FROM password_resets WHERE email = ?', [email]);

        res.render('login', {
            title: 'Login - Express Quiz App',
            message: 'Password reset successful! Please login with your new password.',
            errors: [],
            data: {}
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).render('recovery', {
            title: 'Recovery - Express Quiz App',
            message: null,
            errors: [{ msg: 'Server error during password reset' }],
            data: req.body,
            step: 3
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    resetPassword
};
