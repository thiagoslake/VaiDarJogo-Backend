const Joi = require('joi');

/**
 * Middleware de validação de requisições
 */
const validateRequest = (validationRules) => {
  return (req, res, next) => {
    const errors = {};

    // Validar body
    if (validationRules.body) {
      const bodySchema = Joi.object(validationRules.body);
      const { error } = bodySchema.validate(req.body);
      
      if (error) {
        errors.body = error.details.map(detail => detail.message);
      }
    }

    // Validar query
    if (validationRules.query) {
      const querySchema = Joi.object(validationRules.query);
      const { error } = querySchema.validate(req.query);
      
      if (error) {
        errors.query = error.details.map(detail => detail.message);
      }
    }

    // Validar params
    if (validationRules.params) {
      const paramsSchema = Joi.object(validationRules.params);
      const { error } = paramsSchema.validate(req.params);
      
      if (error) {
        errors.params = error.details.map(detail => detail.message);
      }
    }

    // Se há erros, retornar 400
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors
      });
    }

    next();
  };
};

/**
 * Validação específica para telefone brasileiro
 */
const validateBrazilianPhone = (phone) => {
  const phoneRegex = /^(\+55|55)?\s?\(?([0-9]{2})\)?\s?([0-9]{4,5})\-?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

/**
 * Validação específica para data ISO
 */
const validateISODate = (date) => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Validação específica para UUID
 */
const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

module.exports = {
  validateRequest,
  validateBrazilianPhone,
  validateISODate,
  validateUUID
};




