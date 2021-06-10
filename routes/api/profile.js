const express = require('express');
const router = express.Router();

//@route   Get/api/profile
//@desc    profile routes
//@access  public
router.get('/', (req, res) => {
  res.send('Profile route');
});

module.exports = router;
