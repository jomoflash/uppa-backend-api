const express = require('express');
const router = express.Router();

//@route   Get/api/post
//@desc    post route
//@access  public
router.get('/', (req, res) => {
  res.send('Post route');
});

module.exports = router;
