const db = require('../database/connection');

const getProfile = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const [users] = await db.query(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [req.session.userId]
        );

        if (users.length === 0) {
            return res.redirect('/login');
        }

        const user = users[0];

        // Format the date
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        user.memberSince = user.created_at.toLocaleDateString('en-US', options);

        const [scores] = await db.query(
            'SELECT * FROM scores WHERE user_id = ? ORDER BY taken_at DESC LIMIT 10',
            [req.session.userId]
        );

        // Calculate statistics
        let avgScore = 0;
        let highestScore = 0;
        if (scores.length > 0) {
            const sum = scores.reduce((acc, s) => acc + s.score, 0);
            avgScore = Math.round(sum / scores.length);
            highestScore = Math.max(...scores.map(s => s.score));
        }

        res.render('profile', {
            title: 'Profile - Express Quiz App',
            user: user,
            scores: scores,
            stats: {
                avgScore,
                totalQuizzes: scores.length,
                highestScore,
                streak: 0
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).send('Server Error');
    }
};

const updateProfile = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const { field, value } = req.body;
        const userId = req.session.userId;

        if (!field || value === undefined) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        let query = '';
        let params = [];

        if (field === 'fullName') {
            query = 'UPDATE users SET username = ? WHERE id = ?';
            params = [value, userId];
            req.session.username = value; // Update session
        } else if (field === 'email') {
            query = 'UPDATE users SET email = ? WHERE id = ?';
            params = [value, userId];
        } else if (field === 'password') {
            const salt = await require('bcryptjs').genSalt(10);
            const hashedPassword = await require('bcryptjs').hash(value, salt);
            query = 'UPDATE users SET password = ? WHERE id = ?';
            params = [hashedPassword, userId];
        } else {
            return res.status(400).json({ success: false, message: 'Invalid field' });
        }

        await db.query(query, params);

        res.json({ success: true, message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
