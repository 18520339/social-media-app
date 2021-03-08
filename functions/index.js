const app = require('express')();
const { firestore, functions } = require('./firebase');
const screamController = require('./routes/scream.routes');
const userController = require('./routes/user.routes');

app.use('/', screamController);
app.use('/', userController);
exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
    .document('likes/{id}')
    .onCreate(snapshot => {
        firestore
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                )
                    return firestore.doc(`/notifications/${snapshot.id}`).set({
                        screamId: doc.id,
                        sender: snapshot.data().userHandle,
                        recipient: doc.data().userHandle,
                        createdAt: new Date().toISOString(),
                        type: 'like',
                        read: false,
                    });
            })
            .catch(console.error);
    });

exports.createNotificationOnComment = functions.firestore
    .document('comments/{id}')
    .onCreate(snapshot => {
        firestore
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                )
                    return firestore.doc(`/notifications/${snapshot.id}`).set({
                        screamId: doc.id,
                        sender: snapshot.data().userHandle,
                        recipient: doc.data().userHandle,
                        createdAt: new Date().toISOString(),
                        type: 'comment',
                        read: false,
                    });
            })
            .catch(console.error);
    });

exports.deleteNotificationOnUnlike = functions.firestore
    .document('likes/{id}')
    .onDelete(snapshot => {
        firestore
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(console.error);
    });
