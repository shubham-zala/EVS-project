const express = require('express');
// const router = express.Router()
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const pool = require('../database/db');
// const authMiddleware = require('../middleware/authMiddleware');
// const session = require('express-session');
// const {v4 : uuidv4} = require('uuid');
// const jwt = require('jsonwebtoken');
// const passport = require('passport');
// const generateJwtTokens = require('../utils/jwt_helpers');

// const { setUser } = require('../service/auth');

// homepage
const homepage = asyncHandler(async (req, res) => {
    res.render('homepage_nl.ejs');
});


// login
const loginPage = asyncHandler(async(req , res)=>{
    res.render('login.ejs');
});


//checking login for both client and freelancer
const loginCheck = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the email exists in the ngo table
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

            console.log('Logged in by NGO'); // Log the successful login
            return res.redirect('user_profile.ejs'); // Redirect to the homepage after successful login
        }

        // If the email doesn't exist in the ngo table, check the user_data table
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

        console.log('Logged in by USER'); // Log the successful login
        const user_name = await pool.query('SELECT user_name FROM user_data WHERE user_email = $1', [email]);
        return res.render('user_profile.ejs',{user_name:user_name.rows[0].user_name}); // Redirect to the homepage after successful login
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// signup
const signUp = asyncHandler(async (req, res) => {
    res.render('signUp.ejs');
});
const signUp_user = asyncHandler(async(req , res)=>{
    res.render('register.ejs');
});
const signUp_ngo = asyncHandler(async(req , res)=>{
    res.render('register_ngo.ejs');
});


// new signup
const new_signUp_user = asyncHandler(async (req, res) => {
    const {
        user_name, user_email, user_phone_no, user_password
    } = req.body;

    try {
        // Hash the password
        const hashedPassword = user_password

        // Check if the email is already registered
        const emailCheckResult = await pool.query('SELECT * FROM user_data WHERE user_email = $1', [user_email]);
        if (emailCheckResult.rows.length > 0) {
            return res.json({ message: 'Email already registered' });
        }

        const random_number = Math.floor(Math.random() * 10000000000000000);
        
        // If the email is not registered, insert the new user into the database
        const insertResult = await pool.query(
            'INSERT INTO user_data (user_id, user_name, user_email, user_phone_no, user_password) VALUES ($1, $2, $3, $4, $5)',
            [random_number, user_name, user_email, user_phone_no, hashedPassword]
        );

        // Handle the successful registration
        return res.json({ message: 'Email registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


const new_signUp_ngo = asyncHandler(async (req, res) => {
    const {
        ngo_name, description, ngo_email, ngo_contact, ngo_password
    } = req.body;

    // Assuming req.file contains the photo file uploaded via Multer middleware
    const ngo_photo = req.file ? req.file.buffer : null;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(ngo_password, 10);

        // Check if the email is already registered
        const emailCheckResult = await pool.query('SELECT * FROM ngo WHERE email = $1', [ngo_email]);
        if (emailCheckResult.rows.length > 0) {
            return res.json({ message: 'Email already registered' });
        }

        const random_number = Math.floor(Math.random() * 10000000000000000);
        // If the email is not registered, insert the new NGO into the database
        const insertResult = await pool.query(
            'INSERT INTO ngo (ngo_id,ngo_name, description, ngo_password,email,ngo_contact ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [random_number,ngo_name, description,hashedPassword, ngo_email, ngo_contact]
        );

        // Handle successful registration
        res.json({ message: 'NGO registered successfully', insertedNGO: insertResult.rows[0] });
    } catch (error) {
        console.error('Error registering NGO:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


const logout = asyncHandler(async (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

// const createSession = (req, res, next) => {
//     passport.authenticate(['client-local', 'freelancer-local'], (err, user, info) => {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             return res.redirect('/login'); // Redirect to a common login page
//         }
//         req.logIn(user, (err) => {
//             if (err) {
//                 return next(err);
//             }
//             if (user.role === 'client') {
//                 let client = pool.query('SELECT * FROM client WHERE email_id = $1', [email]);
//                 return res.redirect('client_profile.ejs', { client });
//             } else if (user.role === 'freelancer') {
//                 let freelancer = pool.query('SELECT * FROM freelancer WHERE email_id = $1', [email]);
//                 return res.redirect('freelancer_profile.ejs', { freelancer });
//             }
           
//         });
//     })(req, res, next);
// };

// homepage for particular client and freelancer
const homepage_logged_ngo = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const ngoId = parseInt(id, 10);
    if (isNaN(clientId)) {
        return res.status(400).send('Invalid client ID');
    }

    try {
        let client = await pool.query("SELECT * FROM ngo WHERE ngo_id = $1", [ngoId]);

        if (client.rows.length === 0) {
            return res.status(404).send('Client not found');
        }

        client = client.rows[0];
        res.render('homepage_logged_client.ejs', { user: client });
    } 
    catch (error) {
        // console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

const homepage_logged_user = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const userId = parseInt(id, 10);
    if (isNaN(freelancerId)) {
        return res.status(400).send('Invalid freelancer ID');
    }

    try {
        let freelancer = await pool.query("SELECT * FROM user_data WHERE user_id = $1", [userId]);

        if (freelancer.rows.length === 0) {
            return res.status(404).send('Freelancer not found');
        }

        freelancer = freelancer.rows[0];
        res.render('homepage_logged_freelancer.ejs', { user: freelancer });
    } 
    catch (error) {
        // console.error(error);
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