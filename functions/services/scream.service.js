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
        .then(doc => res.json({ message: `${doc.id} created successfully` }))
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
