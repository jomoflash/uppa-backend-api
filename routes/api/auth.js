const express = require('express');
const router = express.Router();

//@route   Get/api/auth
//@desc    auth routes
//@access  public
router.get('/', (req, res) => {
  res.send('auth route');
});

module.exports = router;
