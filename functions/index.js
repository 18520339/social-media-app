const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const app = express();

app.get('/screams', (req, res) => {
    admin
        .firestore()
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
    if (req.method !== 'POST')
        return res.status(400).json({ error: 'Method not allowed' });

    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString(),
    };

    admin
        .firestore()
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: `Document ${doc.id} created successfully` });
        })
        .catch(err => {
            res.status(500).json({ error: 'Something went wrong' });
            console.error(err);
        });
});

exports.api = functions.region('asia-southeast2').https.onRequest(app);
