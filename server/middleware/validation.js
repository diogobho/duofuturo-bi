import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    next();
  };
};

export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    data_nascimento: Joi.date().max('now').required(),
    endereco: Joi.string().min(10).max(200).required(),
    role: Joi.string().valid('viewer', 'creator').default('viewer')
  }),

  updateUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    nome: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    data_nascimento: Joi.date().max('now'),
    endereco: Joi.string().min(10).max(200),
    role: Joi.string().valid('viewer', 'creator')
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    data_nascimento: Joi.date().required(),
    new_password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
  }),

  dashboard: Joi.object({
    classe: Joi.string().required(),
    nome: Joi.string().required(),
    iframe: Joi.string().uri().required(),
    link: Joi.string().uri().required(),
    link_mobile: Joi.string().uri().required()
  })
};