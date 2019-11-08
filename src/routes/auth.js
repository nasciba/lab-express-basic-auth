const express = require("express");
const router = express.Router();
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const mongoose = require('mongoose');


router.use(session({
    secret: "basic-auth-secret",
    cookie: { maxAge: 60000 },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 24 * 60 * 60 // 1 day
    })
}));

router.get("/", (req, res, next) => {
    res.render("home");
});

router.get("/signup", (req, res, next) => {
    res.render("./auth/signup");
});

router.get("/login", (req, res, next) => {
    res.render("./auth/login");
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
            errorMessage: "Informe usuário e senha para continuar"
        })
    }

    User.findOne({ "username": username })
        .then(user => {
            if (user !== null) {
                res.render("auth/signup", {
                    errorMessage: "O nome usuário escolhido já existe"
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

router.post("/login", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username === "" || password === "") {
        res.render("auth/login", {
            errorMessage: "Por favor, insira usuário e senha para continuar"
        });
        return;
    }

    User.findOne({ "username": username })
        .then(user => {
            if (!user) {
                res.render("auth/login", {
                    errorMessage: "O nome de usuário informado não existe"
                });
                return;
            }
            if (bcrypt.compareSync(password, user.password)) {
                req.session.currentUser = user;
                res.render("auth/main", {user});
                

            } else {
                res.render("auth/login", {
                    errorMessage: "Senha incorreta"
                });
            }
        })
        .catch(error => {
            next(error);
        })
});

router.use((req, res, next) => {
    if (req.session.currentUser) { 
      next(); 
    } else {                        
      res.redirect("/login");        
    }                                
  }); 

  router.get("/private", (req, res, next) => {
    res.render("auth/private");
  });

module.exports = router;