const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    res.status(201).send({ message: 'User created successfully', uid: user.uid });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(userRecord.uid);

    res.status(200).send({ message: 'Login successful', token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
