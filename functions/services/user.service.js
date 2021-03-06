const { firebase, firestore } = require('../firebase');

exports.createUser = (req, res) => {
    const { email, password, handle } = req.body;
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
};

exports.login = (req, res) => {
    const { email, password } = req.body;
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
};

exports.uploadImage = (req, res) => {};
