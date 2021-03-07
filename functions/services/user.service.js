const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

const { admin, firebase, firestore } = require('../firebase');
const { storageBucket } = require('../firebase/config');
const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o`;

exports.signUp = (req, res) => {
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
                avatarUrl: `${storageUrl}/default-avatar.jpg?alt=media`,
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

exports.uploadAvatar = (req, res) => {
    const busboy = new BusBoy({ headers: req.headers });
    let avatar;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        const extname = path.extname(filename);
        if (!/jpe?g|png|gif/.test(extname))
            return res.status(400).json({ error: 'Only image is allowed' });

        const avatarName = `${Date.now()}-${filename}`;
        const filepath = path.join(os.tmpdir(), avatarName);
        const url = `${storageUrl}/${avatarName}?alt=media`;

        avatar = { filepath, url, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(avatar.filepath, {
                resumable: false,
                metadata: { metadata: { contentType: avatar.mimetype } },
            })
            .then(() => {
                return firestore
                    .doc(`/users/${req.user.handle}`)
                    .update({ avatarUrl: avatar.url });
            })
            .then(() => res.status(200).json({ message: 'Image uploaded' }))
            .catch(err => {
                console.error(err);
                return res.status(500).json({ error: err.code });
            });
    });
    busboy.end(req.rawBody);
};
