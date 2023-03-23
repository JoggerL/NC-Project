const express = require('express');
const router = express.Router();

router.get("/check-session", (req, res) => {
    if (req.session.userId && req.session.userType) {
        res.send({ userId: req.session.userId, userType: req.session.userType, username: req.session.username });
    } else {
        res.status(401).send();
    }
});

module.exports = router;