import { body, validationResult } from 'express-validator';

export const validateAssignDelivery = [
  body('orderId').isString().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Add to route:
// router.post('/assign', validateAssignDelivery, authorize('restaurant'), assignDelivery);