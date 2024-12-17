// import
const express = require('express');
const { registerUser, login } = require('../controllers/auth');
const router = express.Router();


// login
router.post('/login', login);

//register
router.post('/register', registerUser);

module.exports = router;
