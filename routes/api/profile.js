const express = require('express');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const router = express.Router();

//@route   Get/api/profile/me
//@desc    Get current users profile
//@access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id}).populate(
      'user',
      ['name', 'avater']
    );

    if (!profile) {
      return res.status(400).json({msg: 'There is no profile for this user'});
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   Post/api/profile
//@desc    Create & Update profile
//@access  Private

router.post(
  '/',
  [
    auth,
    [
      check('skills', 'Skills is required').not().isEmpty(),
      check('status', 'Status is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {
      company,
      website,
      skills,
      status,
      location,
      bio,
      githubusername,
      youtube,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    // Build profile obj
    const profileField = {};
    profileField.user = req.user.id;
    if (company) profileField.company = company;
    if (website) profileField.website = website;
    if (location) profileField.location = location;
    if (status) profileField.status = status;
    if (bio) profileField.bio = bio;
    if (githubusername) profileField.githubusername = githubusername;
    if (skills) {
      profileField.skills = skills.split(',').map((skill) => skill.trim());
    }

    try {
      let profile = await Profile.findOne({user: req.user.id});

      // Update profile
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          {user: req.user.id},
          {$set: profileField},
          {new: true}
        );

        return res.json(profile);
      }

      // Create a new profile
      profile = new Profile(profileField);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route   Get/api/profile
//@desc    Get all profile
//@access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avater']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   Get/api/profile/user/user_id
//@desc    Get profile by user id
//@access  Private
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avater']);

    if (!profile) {
      return res.status(404).json({msg: 'Profile not found'});
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({msg: 'Profile not found'});
    }
    res.status(500).send('Server Error');
  }
});

//@route   Delete/api/profile
//@desc    Delete profile & user
//@access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove Profile
    await Profile.findAndRemove({user: req.user.id});

    // Remove User
    await User.findAndRemove({_id: req.user.id});

    res.json({msg: 'User deleted'});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   Put/api/profile/experience
//@desc    Add experience
//@access  Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('form', 'Form date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {title, company, location, form, to, current, description} = req.body;

    const newExp = {
      title,
      company,
      location,
      form,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({user: req.user.id});

      // Add experience to our profile
      profile.experience.unshift(newExp);

      // save profile
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route   Delete/api/profile/experience/:epx_id
//@desc    Delete experience
//@access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id});

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route   Put/api/profile/education
//@desc    Add education
//@access  Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('fieldofstudy', 'Field Of Study is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('form', 'Form Date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {
      school,
      degree,
      fieldofstudy,
      form,
      to,
      description,
      current,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      form,
      to,
      description,
      current,
    };

    try {
      // find profile
      const profile = await Profile.findOne({user: req.user.id});

      // add education
      profile.education.unshift(newEdu);

      // save profile
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route   Delete/api/profile/education/:edu_id
//@desc    Delete education
//@access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id});

    // loop 2ru the educations
    const removeEdu = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    // delete education
    profile.education.splice(removeEdu, 1);

    // save education
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
