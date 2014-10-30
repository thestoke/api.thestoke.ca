/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Token = require('../models/token');
var auth = require('../lib/auth')

router.route("/posts")
  .get(function(req, resp) {
    Post.findRecentlyVerified(function(err, posts){
      var data = {};
      if (err) {
        // Into an array to match with how validation will happen on other routes
        data.errors = [err];
      }
      data.posts = posts;
      resp.json(data);
    });
  })
  .post(function(req, resp) {
    var post = new Post(req.body);
    //todo: Remove guid/uuid/other fields users shouldn't be able to specify
    post.save(function(errors, post){
      var data = {};
      if (errors){
        data.errors = errors;
      }
      data.post = post;
      Token.create({'post_id' : post.id, 'email' : post.email}, function(errors, token) {
        if (errors){
          //TODO: Add errors
        }
        resp.json(data);
      })

    });
  });

  router.route("/posts/:id")
      .get(function(req, resp) {
         Post.findById(req.params.id, function(errors,post) {
            var data = {};
            if (errors){
               data.errors = errors;
            }
            data.post = post;
            resp.json(data);
         });
      })
      .put(auth, function (req, resp) {
         var post = Post.findById(req.params.id, function(err,post) {
         //todo: Handle errors
         //todo: Make sure you can't edit things like id or uuid
            post.update(req.body)
            post.save(function(errors, post){
               var data = {};
               if (errors){
                  data.errors = errors;
               }
               data.post = post;
               resp.json(data);
            });
         });
      })
      .delete(auth, function (req, resp) {
         var post = Post.findById(req.params.id, function(err,post) {
         //todo: Handle errors
         //todo: Make sure you can't edit things like id or uuid
            post.delete(function(errors){
               var data = {};
               if (errors){
                  data.errors = errors;
               }
               resp.json(data);
            });
         });
      });

  router.route("/posts/:id/votes")
      .get(function(req, resp) {
         Post.findByPostId(req.params.id, function(errors,votes) {
            var data = {};
            if (errors){
               data.errors = errors;
            }
            data.votes = votes;
            resp.json(data);
         });
      });

module.exports = router;
