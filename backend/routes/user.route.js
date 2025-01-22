const express = require('express');

const router = express.Router();



router.get("/", (req, res) => {
    res.send("THis is the profile route")
})

module.exports = router;