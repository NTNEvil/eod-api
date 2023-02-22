require('dotenv').config();
const users = require('./api/repository/users');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const express = require('express');

const SECRET = process.env.SECRET;

const app = express();

app.use(express.json())

// cors
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

// JWT
function verifyJWT(req, res, next) {
    const token = req.headers['x-acess-token'];
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).end();

        req.id = decoded.id;
        next();
    });
}

// login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = { username, password };
    users.login(user).then((response) => {
        if (response != null) {
            const token = jwt.sign({ id: response.id }, SECRET, { expiresIn: "7d" });
            return res.json({ auth: true, token: token });
        }

        res.status(401).json({
            error: 'Incorrect username or password'
        });
    });
});

// get default
app.get('/', (req, res) => {
    res.send('Working!');
})

app.listen(3000);