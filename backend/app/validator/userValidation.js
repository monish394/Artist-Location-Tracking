// validation/userValidation.js
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('artist', 'fan').required().messages({
    'any.only': 'Role must be artist or fan',
    'any.required': 'Role is required',
  }),

  // Artist-only fields
  artistName: Joi.when('role', {
    is: 'artist',
    then: Joi.string().required().messages({
      'any.required': 'artistName is required for artist role',
    }),
    otherwise: Joi.forbidden(),
  }),
  stageName: Joi.when('role', {
    is: 'artist',
    then: Joi.string().allow('', null),
    otherwise: Joi.forbidden(),
  }),
  bio: Joi.when('role', {
    is: 'artist',
    then: Joi.string().allow('', null),
    otherwise: Joi.forbidden(),
  }),
  genre: Joi.when('role', {
    is: 'artist',
    then: Joi.string().allow('', null),
    otherwise: Joi.forbidden(),
  }),

  // Shared location fields (allowed for both roles)
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),

  // Fan-only fields
  firstName: Joi.when('role', {
    is: 'fan',
    then: Joi.string().required().messages({
      'any.required': 'firstName is required for fan role',
    }),
    otherwise: Joi.forbidden(),
  }),
  lastName: Joi.when('role', {
    is: 'fan',
    then: Joi.string().required().messages({
      'any.required': 'lastName is required for fan role',
    }),
    otherwise: Joi.forbidden(),
  }),
  dateOfBirth: Joi.when('role', {
    is: 'fan',
    then: Joi.date().iso().allow('', null),
    otherwise: Joi.forbidden(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});