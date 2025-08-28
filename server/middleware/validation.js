import Joi from 'joi';

export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  createUser: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    data_nascimento: Joi.date().required(),
    endereco: Joi.string().max(500).required(),
    role: Joi.string().valid('viewer', 'creator').default('viewer')
  }),
  
  register: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    data_nascimento: Joi.date().required(),
    endereco: Joi.string().max(500).required(),
    role: Joi.string().valid('viewer', 'creator').default('viewer')
  })
};

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }
    next();
  };
};
