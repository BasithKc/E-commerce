// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  // Check if user is authenticated (you should replace this with your actual authentication logic)
  if ((!req.session.userId || !req.session.adminId)) { // Assuming you're using sessions
    // If user is authenticated, redirect away from login page
    return res.redirect('/'); // Redirect to dashboard or home page
  }
  // If user is not authenticated, continue to next middleware
  next();
}
module.exports = isAuthenticated