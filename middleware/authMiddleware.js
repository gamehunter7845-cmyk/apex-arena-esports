const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next(); // Authenticated, proceed
  }
  req.flash('error_msg', 'Please login to access the admin panel.');
  res.redirect('/admin/login');
};

module.exports = { isAdmin };