const express = require('express')
const app = express()
const cors = require('cors');
const router = require('./routes/index');


//Middlewares
app.use(express.json());
app.use(cors());


//Database connect


//Routers
app.use("/api/v1/", router);

app.get('/', (req, res) => {
    res.send("Groove streets, home!")
})

module.exports = app;
