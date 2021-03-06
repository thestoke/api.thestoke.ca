#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var postmark = require("postmark")(process.env.POSTMARK_KEY);
var RedisStore = require('connect-redis')(expressSession);
var expressValidator = require('express-validator');

app.use(cookieParser());
app.use(expressSession({
  store: new RedisStore({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    db: parseInt(process.env.REDIS_DB),
    pass: process.env.REDIS_PASS
  }),
  secret: process.env.COOKIE_SECRET,
  saveUninitialized: true,
  resave: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());


app.use(express.static(__dirname + '/public'));


var posts = require("./controllers/posts");
var votes = require("./controllers/votes");
var tokens = require("./controllers/tokens");

app.use("/api", posts);
app.use("/api", votes);
app.use("/api", tokens);

var port = process.env.PORT;

app.listen(port);

console.log(
  "HTTP server up and listening on port " +
  port +
  " ( Likely http://localhost:" +
  port +
  " )"
);
