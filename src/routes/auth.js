const express = require("express");
const router = express.Router();

router.get("/signup", (req, res, next) => {
    res.render("./auth/signup");
});

const User = require("../models/user");
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));

router.post("/signup", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === "" || password === "") {
        res.render('./auth/signup', {
            errorMessage: "Indicate a username and password to signup!"
        })
    }

    User.findOne({ "username": username })
        .then(user => {
            if (user !== null) {
                res.render("auth/signup", {
                    errorMessage: "The username already exists!"
                });
                return;
            }

            const salt = bcrypt.genSaltSync(bcryptSalt);
            const hashPass = bcrypt.hashSync(password, salt);

            User.create({
                username,
                password: hashPass
            })
                .then(() => {
                    res.redirect("/");
                })
                .catch(error => {
                    console.log(error);
                })
        })
        .catch(error => {
            next(error);

        })

});

module.exports = router;