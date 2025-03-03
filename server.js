const express = require('express');
const app = express();
const port = 2104;
const bodyParser = require('body-parser');
const session = require('express-session');
const search_controller = require('./controllers/search_controller');
const passport = require('passport');

const PgSession = require('connect-pg-simple')(session);
const crypto = require('crypto');
const pool = require('./database/db');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));

const sessionStore = new PgSession({
    pool,
    tableName: 'session',
  });
  

  const secret = crypto.randomBytes(32).toString('hex');
  

  app.use(
    session({
      secret: secret,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 5 ,
      },
      store: sessionStore,
    })
  );
  
  app.use(passport.initialize());

  app.use(passport.session());
  app.use('/', require('./routes/homepage_routes'));


app.get('/search', async (req, res) => {
  const searchTerm = req.query.search;

  try {
    const rows = await search_controller.search_products(searchTerm);
    res.render('searchResult_project.ejs', { rows });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});