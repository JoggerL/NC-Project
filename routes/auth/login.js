const express = require('express');
const db = require("../../db/connect");
const router = express.Router();

router.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const usertype = req.body.userType
    let collection = await (await db).collection("users");
    try {
        // const account = await Account.findByUsernamePassword(username, password);
        let newDocument = req.body;
        let account = await collection.findOne(newDocument);

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

router.get("/all", async (req, res) => {
    let collection = await (await db).collection("dishes");
    let results = await collection.find({})
        .limit(50)
        .toArray();

    res.send(results).status(200);
});

module.exports = router;