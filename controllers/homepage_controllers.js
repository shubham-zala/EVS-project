const express = require('express');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const pool = require('../database/db');

// homepage
const homepage = asyncHandler(async (req, res) => {
    res.render('homepage_nl.ejs');
});

// login page
const loginPage = asyncHandler(async (req, res) => {
    res.render('login.ejs');
});

// login check
const loginCheck = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check NGO table
        let result = await pool.query('SELECT * FROM ngo WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const storedPassword = result.rows[0].ngo_password;
            const isPasswordValid = await bcrypt.compare(password, storedPassword);
            if (!isPasswordValid) {
                return res.json({ message: 'Invalid password' });
            }

            res.cookie('ngo_cookie', {
                httpOnly: true,
                maxAge: 60 * 1000,
            });

            console.log('Logged in by NGO');
            return res.redirect('user_profile.ejs');
        }

        // Check user_data table
        result = await pool.query('SELECT * FROM user_data WHERE user_email = $1', [email]);
        if (result.rows.length === 0) {
            return res.json({ message: 'Email not registered' });
        }

        const storedPassword = result.rows[0].user_password;
        const isPasswordValid = await bcrypt.compare(password, storedPassword);
        if (!isPasswordValid) {
            return res.json({ message: 'Invalid password' });
        }

        res.cookie('user_cookie', {
            domain: 'localhost',
            httpOnly: true,
            maxAge: 60 * 1000,
        });

        console.log('Logged in by USER');
        const user_name = await pool.query('SELECT user_name FROM user_data WHERE user_email = $1', [email]);
        return res.render('user_profile.ejs', { user_name: user_name.rows[0].user_name });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// signup views
const signUp = asyncHandler(async (req, res) => {
    res.render('signUp.ejs');
});
const signUp_user = asyncHandler(async (req, res) => {
    res.render('register.ejs');
});
const signUp_ngo = asyncHandler(async (req, res) => {
    res.render('register_ngo.ejs');
});

// new user signup (✅ fixed here)
const new_signUp_user = asyncHandler(async (req, res) => {
    const {
        user_name, user_email, user_phone_no, user_password
    } = req.body;

    try {
        // ✅ Hash the password before storing
        const hashedPassword = await bcrypt.hash(user_password, 10);

        // Check if email already registered
        const emailCheckResult = await pool.query('SELECT * FROM user_data WHERE user_email = $1', [user_email]);
        if (emailCheckResult.rows.length > 0) {
            return res.json({ message: 'Email already registered' });
        }

        const random_number = Math.floor(Math.random() * 10000000000000000);

        // Insert into user_data table
        await pool.query(
            'INSERT INTO user_data (user_id, user_name, user_email, user_phone_no, user_password) VALUES ($1, $2, $3, $4, $5)',
            [random_number, user_name, user_email, user_phone_no, hashedPassword]
        );

        return res.json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// new ngo signup (already correct ✅)
const new_signUp_ngo = asyncHandler(async (req, res) => {
    const {
        ngo_name, description, ngo_email, ngo_contact, ngo_password
    } = req.body;

    const ngo_photo = req.file ? req.file.buffer : null;

    try {
        const hashedPassword = await bcrypt.hash(ngo_password, 10);

        const emailCheckResult = await pool.query('SELECT * FROM ngo WHERE email = $1', [ngo_email]);
        if (emailCheckResult.rows.length > 0) {
            return res.json({ message: 'Email already registered' });
        }

        const random_number = Math.floor(Math.random() * 10000000000000000);

        const insertResult = await pool.query(
            'INSERT INTO ngo (ngo_id, ngo_name, description, ngo_password, email, ngo_contact) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [random_number, ngo_name, description, hashedPassword, ngo_email, ngo_contact]
        );

        res.json({ message: 'NGO registered successfully', insertedNGO: insertResult.rows[0] });
    } catch (error) {
        console.error('Error registering NGO:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// logout
const logout = asyncHandler(async (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

// logged-in homepage views
const homepage_logged_ngo = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const ngoId = parseInt(id, 10);
    if (isNaN(ngoId)) {
        return res.status(400).send('Invalid NGO ID');
    }

    try {
        let ngo = await pool.query("SELECT * FROM ngo WHERE ngo_id = $1", [ngoId]);
        if (ngo.rows.length === 0) {
            return res.status(404).send('NGO not found');
        }

        ngo = ngo.rows[0];
        res.render('homepage_logged_client.ejs', { user: ngo });
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
});

const homepage_logged_user = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
        return res.status(400).send('Invalid User ID');
    }

    try {
        let user = await pool.query("SELECT * FROM user_data WHERE user_id = $1", [userId]);
        if (user.rows.length === 0) {
            return res.status(404).send('User not found');
        }

        user = user.rows[0];
        res.render('homepage_logged_freelancer.ejs', { user });
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = {
    homepage,
    loginPage,
    loginCheck,
    signUp,
    signUp_user,
    signUp_ngo,
    new_signUp_user,
    new_signUp_ngo,
    logout,
    homepage_logged_ngo,
    homepage_logged_user
};
