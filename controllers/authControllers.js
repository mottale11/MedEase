// import
const db = require("../db");
const bcrypt = require("bcrypt");

// user registration function
exports.registerUser = async (req, res) => {
    // fetch data
    const { username, email, password } = req.body;
    try{
        // check if user exists
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user into database
        await db.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try{
        // check if user exists 
        const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        // check if password is correct
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}