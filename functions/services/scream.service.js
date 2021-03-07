const { firestore } = require('../firebase');

exports.getScreams = (req, res) => {
    firestore
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            const screams = data.docs.map(doc => ({
                screamId: doc.id,
                ...doc.data(),
            }));
            return res.json(screams);
        })
        .catch(console.error);
};

exports.getScreamById = (req, res) => {
    let screamData = {};
    firestore
        .doc(`/screams/${req.params.screamId}`)
        .get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Scream not found' });

            screamData = doc.data();
            screamData.screamId = doc.id;
            return firestore
                .collection('comments')
                .orderBy('createdAt', 'desc')
                .where('screamId', '==', doc.id)
                .get();
        })
        .then(data => {
            screamData.comments = data.docs.map(doc => doc.data());
            return res.status(200).json(screamData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.createScream = (req, res) => {
    if (req.body.body.trim() === '')
        return res.status(400).json({ body: 'Body must not be empty' });

    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString(),
    };

    firestore
        .collection('screams')
        .add(newScream)
        .then(doc => {
            return res.status(201).json({
                message: `Scream ${doc.id} created successfully`,
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.commentOnScream = (req, res) => {
    const { body, params, user } = req;
    if (!body.body.trim())
        return res.status(400).json({ error: 'Must not be empty' });

    const newComment = {
        body: body.body,
        createdAt: new Date().toISOString(),
        screamId: params.screamId,
        userHandle: user.handle,
        userAvatar: user.avatarUrl,
    };

    firestore
        .doc(`screams/${params.screamId}`)
        .get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Scream not found' });
            return firestore.collection('comments').add(newComment);
        })
        .then(doc => {
            return res.status(201).json({
                message: `Comment ${doc.id} created successfully`,
            });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
