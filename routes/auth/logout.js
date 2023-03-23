const express = require('express');
const router = express.Router();

router.get('/logout', (req, res) => {
    // Remove the session
    req.session.destroy((error) => {
        if (error) {
            res.status(500).send(error)
        } else {
            res.status(200).send("success")
            //res.redirect('/')
        }
    })
});

module.exports = router;