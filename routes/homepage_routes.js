const express = require('express');
const router = express.Router();
const passport = require('passport');
const asyncHandler = require('express-async-handler');



const pool = require('../database/db');
const {
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
} = require('../controllers/homepage_controllers');

// Homepage
router.get('/', (req, res) => {
    res.render('homepage.ejs');
});

// // Vounteer Page
// router.get('/volunteer', (req, res) => {
//     res.render('volunteer.ejs');
// });

// // Our Services Page
// router.get('/our_services', (req, res) => {
//     res.render('our_services.ejs');
// });

// Login WebPages
router.get('/login', loginPage);
router.get('/rrr', (req, res) => {
    res.render('rrr.ejs');
}
);
router.get('/volunteer', (req, res) => {
    res.render('volunteer.ejs');
}
);
router.get('/ourservices', (req, res) => {
    res.render('ourservices.ejs');
}
);
router.get('/donate', (req, res) => {
    res.render('donate.ejs');
}
);
router.get('/buy', (req, res) => {
    res.render('buy.ejs');
}
);
router.get('/sell', (req, res) => {
    res.render('sell.ejs');
}
);
// // Own home page for client and freelancer
// router.get('/home/ngo/:id' , homepage_logged_ngo);
// router.get('/home/user/:id' , homepage_logged_user);


// Logout for all users by the help of cookies 
router.post('/logout' ,(req, res) => {
    res.clearCookie('user_cookie');
    res.clearCookie('ngo_cookie');
    res.redirect('/');
});

// Existing Login For Both Client And Freelancer
router.post('/login', require('../controllers/homepage_controllers').loginCheck);

// // Signup Webpages
// router.get('/signup',signUp);
router.get('/signup/ngo',signUp_ngo);
router.get('/signup/user',signUp_user);

// // New Signup For Both Client And Freelancer
router.post('/signup/ngo',new_signUp_ngo);
router.post('/signup/user',new_signUp_user);


module.exports = router;