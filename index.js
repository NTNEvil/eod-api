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

// get money user
app.get('/profile/money', verifyJWT, async (req, res) => {
    const id = req.id;
    db.getMoney(id).then((response) => {
        res.send(response);
    }).catch((error) => {
        res.status(error.status).json({ error: error.message });
    })
});

// add money
app.post('/profile/money/add', verifyJWT, async (req, res) => {
    const id = req.id;
    const value = req.body.money;
    db.addMoney(id, value).then((response) => {
        res.send(response);
    }).catch((error) => {
        res.status(error.status).json({ error: error.message });
    })
});

// get status user
app.get('/profile/status', verifyJWT, async (req, res) => {
    const id = req.id;
    db.getStatus(id).then((response) => {
        res.send(response);
    }).catch((error) => {
        res.status(error.status).json({ error: error.message });
    })
});

app.post('/profile/status/hp', verifyJWT, async (req, res) => {
    const id = req.id;
    const hp = req.body.hp;
    db.hp(id, hp).then((response) => {
        res.send(response);
    }).catch((error) => {
        console.log(error);
        res.status(error.status).json({error: error.message});
    })
});

// add status
app.post('/profile/status/:att/add', verifyJWT, async (req, res) => {
    const id = req.id;
    const att = req.params.att;
    db.addStatus(id, att).then((response) => {
        res.send(response);
    }).catch((error) => {
        res.status(error.status).json({ error: error.message });
    });
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

// STORE
app.get('/store', async (req, res) => {
    db.getStore().then((response) => {
        res.send(response);
    }).catch((error) => {
        res.status(error.status).json({ error: error.message });
    })
})

// buy item
app.post('/store/:itemid/buy', verifyJWT, async (req, res) => {
    const id = req.id;
    const item_id = req.params.itemid;
    db.buyItem(id, item_id).then((response) => {
        res.send(response);
    }).catch((error) => {
        res.status(error.status).json({ error: error.message });
    })
})

// roulette
app.post('/roulette', verifyJWT, async (req, res) => {
    const id = req.id;
    const itemId = req.body.item_id;
    db.roulette(id, itemId).then((response) => {
        res.send(response);
    }).catch((error) => {
        res.status(error.status).json({ error: error.message });
    })
});

app.post('/tct', verifyJWT, async (req, res) => {
    const id = req.id;
    const tctPoints = req.body.points;
    db.tct(id, tctPoints).then((response) => {
        res.send(response);
    }).catch((error) => {
        console.log(error);
        res.status(error.status).json({error: error.message});
    })
});

// get default
app.get('/', (req, res) => {
    res.send('Working!');
})

app.listen(PORT, () => {
    console.log(`Server listener on port: ${PORT}`);
});