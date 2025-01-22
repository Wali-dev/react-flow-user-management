const express = require('express');
const { createUserValidation, updateUserValidator } = require('../validators/user.validator');

const router = express.Router();


router.get("/", (req, res) => {
    res.send("this is the get route")
})
router.post("/", createUserValidation, (req, res) => {
    res.send("this is the post route")
})
router.patch("/", updateUserValidator, (req, res) => {
    res.send("this is the patch route")
})
router.delete("/", (req, res) => {
    res.send("this is the delete route")
})

module.exports = router;