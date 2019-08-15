const express = require("express");
const router = express.Router();
const User = require("../models/User");
var createError = require('http-errors')

/**
 * @api {post} /auth/signup                 Sign up user
 * @apiName Signup
 * @apiGroup Auth
 * @apiDescription After signing up the user is automatically logged in by
 * setting a cookie and maintaining a session server side. This API is build to work with a
 * SPA. Therefore there's no server side redirect. You have to enable cross-site access! If you use axios, you can enable it by setting withCredentials to true. 
 * Otherwise the cookie will not be set and the session will not be maintained on the server. Also bear in mind that you development front-end server should run on https. 
 * With CRA you should start your server with 'HTTPS=true npm start'. Otherwise the cookie will not be set.
 * @apiParam {String} username              Mandatory username. Has to be unique.
 * @apiParam {String} firstname             Mandatory firstname of user.
 * @apiParam {String} lastname              Mandatory lastname of user.
 * @apiParam {String} email                 Mandatory email address of user. Has to be unique.
 * @apiParam {String} password              Mandatory. Minimum eight characters, at least one letter and one number.
 *
 *   @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "message": "user validation failed: ..."
 *     }
 *
 *   @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Oeeeps, something went wrong."
 *     }
 * 
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 *  set-cookie: connect.sid=s%3A0VMqqYBK3LGMKoKeeP8ntme0ZqT2rW95.2LmE%2BkYoa9khWbw7yBPJLHzxrF6b%2FDQhsraFNF%2FIvc8; Path=/; HttpOnly
 *     {
 *        "username": "MasterBrew",
 *        "id": "5d4d3bfc720fb89b71e013cf",
 *        "firstname": "Jurgen",
 *        "lastname": "Tonneyck",
 *        "email": "Jurgen.Tonneyck@ironhack.com",
 *     }
 */

router.post("/signup", (req,res,next)=> {   
    User.create(req.body)
        .then((user)=> {
            let {username, email, firstname, lastname, id} = user;
            let sessionData = {username, email, firstname, lastname, id};
            req.session.user = sessionData;
            res.status(200).json(sessionData);
        })
        .catch((error)=> {
            if(error.name === "ValidationError") next(createError(400, error.message))
            else next(createError(500));
        })
})
/**
 * @api {post} /auth/login                  Log in user
 * @apiName Login
 * @apiDescription After logging a cookie is set and a session is maintained on the server.
 * You have to enable cross-site access! If you use axios, you can enable it by setting withCredentials to true. 
 * Otherwise the cookie will not be set and the session will not be maintained on the server. Also bear in mind that you development front-end server should run on https. 
 * With CRA you should start your server with 'HTTPS=true npm start'. Otherwise the cookie will not be set.
 * This API is build to work with a SPA. Therefore there's no server side redirect. 
 * @apiGroup Auth
 * @apiParam {String} username              Mandatory username. The same field can also contain an email address, but still has to be called 'username'.
 * @apiParam {String} password              Mandatory.
 *
 *   @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *
 *   @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Oeeeps, something went wrong."
 *     }
 * 
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 *  set-cookie: connect.sid=s%3A0VMqqYBK3LGMKoKeeP8ntme0ZqT2rW95.2LmE%2BkYoa9khWbw7yBPJLHzxrF6b%2FDQhsraFNF%2FIvc8; Path=/; HttpOnly
 *     {
 *        "username": "MasterBrew",
 *        "id": "5d4d3bfc720fb89b71e013cf",
 *        "firstname": "Jurgen",
 *        "lastname": "Tonneyck",
 *        "email": "Jurgen.Tonneyck@ironhack.com",
 *     }
 */

router.post("/login", (req,res,next)=> {
    User.findOne({$or: [{username: req.body.username}, {email: req.body.username}]})
        .then((user)=> {
            if(!user) next(createError(401), "Invalid credentials.");
            else {
            return user.comparePasswords(req.body.password)
                .then((match)=> {
                    if(match) {
                        let {username, email, firstname, lastname, id} = user;
                        let sessionData = {username, email, firstname, lastname, id};
                        req.session.user = sessionData;
                        res.status(200).json(sessionData);
                    } else {
                        next(createError(401, "Invalid credentials."));
                    }
                })
            }
        })
        .catch((error)=> {
            next(createError(500));
        })
})

/**
 * @api {get} /auth/logout               Log out user
 * @apiName Logout
 * @apiGroup Auth
 *   
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "message": "Oeeeps, something went wrong."
 *     }
 * 
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 205 Reset Content
 */
 router.get("/logout", (req,res, next)=> {
     req.session.destroy();
     res.status(205).end();
 })

module.exports = router;
