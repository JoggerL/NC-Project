const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const usertype = req.body.userType

    try {
        const account = await Account.findByUsernamePassword(username, password);
        if (!account) {
            res.status(404).send("wrong credentials")
        } else {
            console.log(account)
            req.session.userId = account._id
            req.session.userType = account.userType
            req.session.username = account.username
            res.status(200).send({userId: account._id, userType: account.userType, username: account.username})
        }
    } catch (error) {
        console.log(error)
        res.status(404).send("wrong credentials")
    }
});

module.exports = router;