const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const session = require("express-session");
const loginRoute = require('./routes/auth/login');
const logoutRoute = require('./routes/auth/logout');
const checkSessionRoute = require('./routes/auth/check-session');
const path = require("path");
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});
let connections = [];
let userConn = [];
let drawingData = [];
let users = [];

io.on("connection", (socket) => {
    connections.push(socket);

    console.log(`${socket.id} has connected`);

    const user = {
        id: socket.id,
        username: socket.handshake.query.username, // Get the username from the query
        remainingTime: 0, // Add a field to store the remaining time
    };

    users.push(user);

    socket.emit("userList", users.map((user) => ({ id: user.id, username: user.username, remainingTime: user.remainingTime })));

    socket.on("requestDrawingData", () => {
        socket.emit("initialize", drawingData);
    });

    socket.on('draw', (data) => {
        drawingData.push({ type: 'draw', x: data.x, y: data.y, color: data.color, lineWidth: data.lineWidth, pathId: socket.id });
        connections.forEach(con => {
            if (con.id !== socket.id) {
                con.emit('ondraw', { x: data.x, y: data.y, color: data.color, lineWidth: data.lineWidth, pathId: socket.id })
            }
        })
    });

    socket.on("segmentStart", () => {
        drawingData.push({ type: "segmentStart" });
        socket.broadcast.emit("segmentStart");
    });

    socket.on('down', (data) => {
        drawingData.push({ type: 'down', x: data.x, y: data.y, color: data.color, lineWidth: data.lineWidth });
        connections.forEach(con => {
            if (con.id !== socket.id) {
                con.emit('ondown', { x: data.x, y: data.y, color: data.color, lineWidth: data.lineWidth })
            }
        })
    });

    socket.on('disconnect', (reason)=>{
        connections = connections.filter((con) => con.id !== socket.id);
        console.log(`${socket.id} has connected`)
    });

    socket.on('user_joined', (userData) => {
        userConn.push(userData);
        // Store the user data in the socket for easy access
        socket.userData = userData;
        const userIndex = users.findIndex((u) => u.id === socket.id);
        if (userIndex !== -1) {
            users[userIndex].username = userData.username;
            users[userIndex].password = userData.password;
            users[userIndex].userType = userData.userType;
        }
        // Emit the current list of users to all connected clients
        // io.emit('userList', userConn.map((user) => user.id)); // Emit the updated userList to all connected clients
        io.emit('userList', users.map((user) => ({ id: user.id, username: user.username, remainingTime: user.remainingTime })));
        socket.emit("initialize", drawingData);
    });

    socket.on("start_timer", (time) => {
        const userIndex = users.findIndex((u) => u.id === socket.id);
        if (userIndex !== -1) {
            users[userIndex].remainingTime = time;
            io.emit("userList", users.map((user) => ({ username: user.username, remainingTime: user.remainingTime })));
        }
    });

    socket.on("erase", (data) => {
        connections.forEach((con) => {
            if (con.id !== socket.id) {
                con.emit("onerase", { x: data.x, y: data.y, size: data.size });
            }
        });
    });

    socket.on("user_left", () => {
        users = users.filter((user) => user.id !== socket.id);
        io.emit("userList", users.map((user) => ({ id: user.id, username: user.username, remainingTime: user.remainingTime })));
    });

});


httpServer.listen(8080);
const PORT = process.env.PORT || 3000;
const app = express()
app.use(cors());
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

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.get("/", (req, res) => {
        res.render('home');
    }
);

app.get("/board", (req, res) => {
        res.render('board');
    }
);

app.get("*", (req, res) => {
        res.status(404);
        res.send("nah")
    }
)
// app.listen(process.env.PORT, () => console.log(`Server running on port ${PORT}`));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));