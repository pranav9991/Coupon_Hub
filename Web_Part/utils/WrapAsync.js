module.exports = (fn) => {
  return (req, res, next) => {
    // Ensure req.body exists
    if (!req.body) {
      req.body = {};
    }
    
    // Handle async errors properly
    Promise.resolve(fn(req, res, next))
      .catch(err => {
        console.error('Async error:', err);
        next(err);
      });
  };
};
