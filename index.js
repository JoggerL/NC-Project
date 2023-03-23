const express = require('express');
const dotenv = require('dotenv');
const session = require("express-session");
const loginRoute = require('./routes/auth/login');
const logoutRoute = require('./routes/auth/logout');
const checkSessionRoute = require('./routes/auth/check-session');
const path = require("path");
// const ecgRoute = require('./routes/api/ecg');

const app = express()


app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({path: './config/config.env'});
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")
        res.header("Access-Control-Allow-Credentials", "true");
        next();
    });
}

app.use(express.json());

app.use(session({
    secret: 'our hardcoded secret',
    cookie: {
        expires: 600000,
        httpOnly: true
    },
    // don't save the initial session if the session object is unmodified (for example, we didn't log in).
    saveUninitialized: false,
    // don't resave an session that hasn't been modified.
    resave: false,
}));

app.use('/auth', loginRoute);
app.use('/auth', logoutRoute);
app.use('/auth', checkSessionRoute);

////////
// app.use(express.static(path.join(__dirname, '/client/build/')));

app.get("*", (req, res) => {
        res.status(404);
        res.send()
    }
)

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));