const joi = require("joi");

const userRegistrationSchema = joi.object({
    name: joi.string().required().messages({
        'string.empty': 'Name is required',
        'any.required': 'Name is required'
    }),
    email: joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    }),
    phone: joi.string().pattern(/^[0-9]{10,12}$/).required().messages({
        'string.pattern.base': 'Phone number must be 10-12 digits',
        'string.empty': 'Phone number is required',
        'any.required': 'Phone number is required'
    }),
    password: joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    }),
    ConfirmPassword: joi.string().valid(joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your password',
        'string.empty': 'Please confirm your password'
    })
});

const userLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});

module.exports = {
    userRegistrationSchema,
    userLoginSchema
};
