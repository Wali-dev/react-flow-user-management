const express = require('express');
const { createUserValidation, updateUserValidator } = require('../validators/user.validator');
const { createUser, updateUser, deleteUser, getAllUsers } = require('../controllers/user.controller');

const router = express.Router();


router.get("/", getAllUsers)
router.post("/", createUserValidation, createUser)
router.patch("/:userId", updateUserValidator, updateUser)
router.delete("/:userId", deleteUser)

module.exports = router;