export const errorHandler = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`);
    console.error(err.stack);
  
    // Handle Axios errors from service calls
    if (err.isAxiosError) {
      return res.status(err.response?.status || 500).json({
        success: false,
        message: err.response?.data?.message || 'Service communication failed'
      });
    }
  
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
  
    // Default error handling
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Server error' 
        : err.message
    });
  };