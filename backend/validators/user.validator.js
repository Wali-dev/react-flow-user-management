const { param, body, validationResult } = require('express-validator');
const sendResponse = require('../utils/sendResponse');

const createUserValidationSchema = [
    body("username")
        .notEmpty().withMessage("username cannot be empty")
        .isString().withMessage("Username must be a string"),
    body("age")
        .notEmpty().withMessage("age cannot be empty")
        .isString().withMessage("age must be a number"),
    body("hobbies")
        .notEmpty().withMessage("hobbies cannot be empty")
        .isArray().withMessage("hobbies must be a array"),

];
const updateUserValidationSchema = [
    body("username")
        .isString().withMessage("Username must be a string"),
    body("age")
        .isString().withMessage("age must be a number"),
    // body("hobbies")
    //     .isArray().withMessage("hobbies must be a array"),

];

// const getSingleProfile = [
//     param("username")
//         .notEmpty().withMessage("Username is required")
//         .isString().withMessage("Username must be a string"),
// ];

const updateUserValidator = [
    ...updateUserValidationSchema,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, errors.array()[0].msg);
        }
        next();
    }
];

const createUserValidation = [
    ...createUserValidationSchema,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendResponse(res, 400, false, errors.array()[0].msg);
        }
        next();
    }
];

module.exports = { createUserValidation, updateUserValidator };
