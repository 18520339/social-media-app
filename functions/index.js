const functions = require('firebase-functions').region('asia-southeast2');
const firebase = require('firebase').default;
const admin = require('firebase-admin');
const config = require('./config');

const validator = require('validator').default;
const app = require('express')();

firebase.initializeApp(config.firebaseConfig);
admin.initializeApp();
const firestore = admin.firestore();

app.get('/screams', (req, res) => {
    firestore
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = data.docs.map(doc => ({
                screamId: doc.id,
                ...doc.data(),
            }));
            return res.json(screams);
        })
        .catch(console.error);
});

app.post('/scream', (req, res) => {
    const { body, userHandle } = req.body;
    if (body.trim() === '')
        return res.status(400).json({ body: 'Body must not be empty' });

    const newScream = { body, userHandle, createdAt: new Date().toISOString() };
    firestore
        .collection('screams')
        .add(newScream)
        .then(doc => {
            return res.json({
                message: `Document ${doc.id} created successfully`,
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
});

app.post('/signup', (req, res) => {
    const { email, password, confirm, handle } = req.body;
    const newUser = { email, password, confirm, handle };
    const errors = {};

    // Email
    if (!email) errors.email = 'Email is required';
    else if (!validator.isEmail(email)) errors.email = 'Email is invalid';

    // Password
    if (!password) errors.password = 'Password is required';
    else if (!validator.equals(password, confirm))
        errors.confirm = 'Password must match';

    // Confirm Password
    if (!confirm) errors.confirm = 'Confirm is required';
    else if (!validator.equals(password, confirm))
        errors.confirm = 'Password must match';

    // Handle
    if (!handle) errors.handle = 'Handle is required';

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
    firestore
        .doc(`/users/${handle}`)
        .get()
        .then(doc => {
            if (doc.exists)
                return res.status(400).json({ handle: 'Handle already taken' });
            return firebase
                .auth()
                .createUserWithEmailAndPassword(email, password);
        })
        .then(data => {
            firestore.doc(`/users/${handle}`).set({
                email,
                handle,
                userId: data.user.uid,
                createdAt: new Date().toISOString(),
            });
            return data.user.getIdToken();
        })
        .then(token => res.status(201).json({ token }))
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use')
                return res.status(400).json({ email: 'Email already exists' });
            return res.status(500).json({ error: err.code });
        });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const errors = {};

    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(data => data.user.getIdToken())
        .then(token => res.status(200).json({ token }))
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/wrong-password')
                return res.status(400).json({ password: 'Wrong password' });
            return res.status(500).json({ error: err.code });
        });
});

exports.api = functions.https.onRequest(app);
