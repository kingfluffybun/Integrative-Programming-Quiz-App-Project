const db = require('../database/connection');

const purchaseTheme = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Please login to purchase themes' });
        }

        const { themeName } = req.body;
        const userId = req.session.userId;
        const themeCost = 2000;

        if (!themeName) {
            return res.status(400).json({ success: false, message: 'Theme name is required' });
        }

        // Check if user already owns the theme
        const [existing] = await db.query(
            'SELECT * FROM themes WHERE user_id = ? AND theme_name = ?',
            [userId, themeName]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'You already own this theme' });
        }

        // Check user balance
        const [users] = await db.query('SELECT coins FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userCoins = users[0].coins;
        if (userCoins < themeCost) {
            return res.status(400).json({ success: false, message: 'Insufficient coins' });
        }

        // Process purchase
        await db.query('UPDATE users SET coins = coins - ? WHERE id = ?', [themeCost, userId]);
        await db.query('INSERT INTO themes (user_id, theme_name) VALUES (?, ?)', [userId, themeName]);

        let boughtName = '';

        if (themeName === 'snoopy') {
            boughtName = 'Snoopy';
        } else if (themeName === 'powerpuff-girls') {
            boughtName = 'Powerpuff Girls';
        } else if (themeName === 'spongebob') {
            boughtName = 'Spongebob';
        } else if (themeName === 'adventure-time') {
            boughtName = 'Adventure Time';
        } else if (themeName === 'toy-story') {
            boughtName = 'Toy Story';
        }

        res.json({ 
            success: true, 
            message: `Successfully purchased ${boughtName}!`, 
            newBalance: userCoins - themeCost 
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ success: false, message: 'Server error during purchase' });
    }
};

const getShop = async (req, res) => {
    try {
        const userId = req.session.userId;
        let ownedThemes = [];

        if (userId) {
            const [themes] = await db.query(
                'SELECT theme_name FROM themes WHERE user_id = ?',
                [userId]
            );
            ownedThemes = themes.map(t => t.theme_name);
        }

        res.render('shop', { 
            title: 'Shop - Express Quiz App',
            ownedThemes: ownedThemes
        });
    } catch (error) {
        console.error('Error fetching shop data:', error);
        res.render('shop', { 
            title: 'Shop - Express Quiz App',
            ownedThemes: [],
            error: 'Failed to load owned themes'
        });
    }
};

module.exports = {
    purchaseTheme,
    getShop
};
