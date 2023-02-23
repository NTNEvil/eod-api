require('dotenv').config();
const db = require('./api/repository/database');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const express = require('express');

const SECRET = process.env.SECRET;
const PORT = 3000;

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
    const token = req.headers['x-access-token'];
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).end();

        req.id = decoded.id;
        next();
    });
}

// ROUTES

// USERS
// login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = { username, password };
    db.login(user).then((response) => {
        if (response != null) {
            const token = jwt.sign({ id: response.id }, SECRET, { expiresIn: "7d" });
            return res.json({ auth: true, token: token });
        }

        res.status(401).json({
            error: 'Incorrect username or password'
        });
    });
});

// get profile
app.get('/profile', verifyJWT, async (req, res) => {
    const id = req.id;
    db.getProfile(id).then((response) => {
        res.send(response);
    })
});

// tavern
app.get('/tavern', (req, res) => {
    db.getProfiles().then((response) => {
        res.send(response);
    })
})

// ITEMS
// inventory
app.get('/inventory', verifyJWT, async (req, res) => {
    const id = req.id;
    db.getInventory(id).then((response) => {
        res.send(response);
    })
})

// buy item
app.post('/store/:itemid/buy', verifyJWT, (req, res) => {
    const id = req.id;
    const item_id = req.params.itemid;
    db.buyItem(id, item_id).then((response) => {
        res.send(response);
    }).catch((error) => {
        res.status(error.status).json({ error: error.message });
    })
})

// get default
app.get('/', (req, res) => {
    res.send('Working!');
})

app.listen(PORT, () => {
    console.log(`Server listener on port: ${PORT}`);
});