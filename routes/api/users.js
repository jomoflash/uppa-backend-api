const express = require('express');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
const gravater = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

//@route   Get/api/users
//@desc    Register user
//@access  public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Enter a valid email').isEmail(),
    check(
      'password',
      'Password must have atlest min of 6 characters'
    ).isLength({min: 6}),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
      let user = await User.findOne({email});

      if (user) {
        return res.status(400).json([{msg: 'User already eist'}]);
      }

      const avater = gravater.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        password,
        avater,
      });

      const salt = await bcrypt.genSalt(10);

      //   hash password
      user.password = await bcrypt.hash(password, salt);

      // save user
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.jwtSecrete,
        {expiresIn: 360000},
        (err, token) => {
          if (err) throw err;
          res.json({token});
        }
      );
    } catch (err) {
      console.error(err.msg);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
