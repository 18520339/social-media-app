const functions = require('firebase-functions').region('asia-southeast2');
const firebase = require('firebase').default;
const config = require('./config');

const admin = require('firebase-admin');
const app = require('express')();

firebase.initializeApp(config);
admin.initializeApp();
const firestore = admin.firestore();

app.get('/screams', (req, res) => {
    firestore
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push({ screamId: doc.id, ...doc.data() });
            });
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
            return res.status(500).json({ error: 'Something went wrong' });
        });
});

app.post('/signup', (req, res) => {
    const { email, password, confirmPassword, handle } = req.body;
    const newUser = { email, password, confirmPassword, handle };

    firestore
        .doc(`/users/${newUser.handle}`)
        .get()
        .then(doc => {
            if (doc.exists)
                return res
                    .status(400)
                    .json({ handle: 'This handle is already taken' });
            return firebase
                .auth()
                .createUserWithEmailAndPassword(email, password);
        })
        .then(data => {
            firestore.doc(`/users/${newUser.handle}`).set({
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
                return res
                    .status(400)
                    .json({ email: 'Email is already in use' });
            return res.status(500).json({ error: err.code });
        });
});

exports.api = functions.https.onRequest(app);
