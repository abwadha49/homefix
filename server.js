const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const app = express();

const db = mysql.createConnection({
   host: "mysql.railway.internal",
    user: "root",
    password: "cfkCkLCNqCMsbzKLYqlYkjhUyNdhHkVs",
    database: "railway",
    port: 3306
});

db.connect(err => {
    if (err) throw err;
    console.log("Database connected");
});

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'homefix-secret',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error saving user");
        }
        res.send("User registered successfully");
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Error checking login");
        }

        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/dashboard');
        } else {
            res.send("Invalid email or password");
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.send("You must login first");
    }
}

app.get('/dashboard', isLoggedIn, (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

app.get('/profile', isLoggedIn, (req, res) => {
    res.sendFile(__dirname + '/public/profile.html');
});

app.get('/profile-data', isLoggedIn, (req, res) => {
    res.json({
        username: req.session.user.username,
        email: req.session.user.email
    });
});

app.post('/update-profile', isLoggedIn, (req, res) => {
    const { username, email, password } = req.body;

    const query = "UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?";
    db.query(query, [username, email, password, req.session.user.id], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error updating profile");
        }

        req.session.user.username = username;
        req.session.user.email = email;
        req.session.user.password = password;

        res.send("Profile updated successfully");
    });
});

app.get('/booking', isLoggedIn, (req, res) => {
    res.sendFile(__dirname + '/public/booking.html');
});

app.post('/book', isLoggedIn, (req, res) => {
    const { service, date, time, notes } = req.body;

    const query = "INSERT INTO bookings (user_id, service, date, time, notes) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [req.session.user.id, service, date, time, notes], (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error saving booking");
        }
        res.send("Booking submitted successfully");
    });
});

app.get('/my-bookings', isLoggedIn, (req, res) => {
    const query = "SELECT * FROM bookings WHERE user_id = ?";
    db.query(query, [req.session.user.id], (err, results) => {
        if (err) {
            console.log(err);
            return res.send("Error loading bookings");
        }
        res.json(results);
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send("Logged out successfully");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
