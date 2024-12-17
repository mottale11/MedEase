const bcrypt = require('bcryptjs');
const db = require('../config/database');
const jwt = require('jsonwebtoken');

// Login controller
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        const [users] = await db.execute(
            'SELECT * FROM patients WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send successful response
        res.status(200).json({
            success: true,
            token,
            patientId: user.id,
            username: user.username
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
};

// Register controller
exports.registerUser = async (req, res) => {
    const { username, password, email, fullName } = req.body;

    try {
        // Check if user already exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM patients WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO patients (username, password, email, full_name) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, fullName]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.insertId, username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            patientId: result.insertId,
            username
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
};
