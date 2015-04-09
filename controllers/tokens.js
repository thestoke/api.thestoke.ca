 /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Token = require('../models/token');

   router.route("/tokens")
      .post(function(req, resp) {
         Token.create({'email' : req.body.email}, function(errors, token) {
            var data = {};
            if (errors){
               data.errors = errors;
               resp.status(400);
            }
            resp.json(data);
         })
      })
      .delete(function(req,resp) {
         req.session.destroy(function(errors) {
            var data = {};
            if (errors){
               data.errors = errors;
               resp.status(400);
            }
            resp.json(data);
         })
      });


   router.route("/tokens/:value")
      .put(function(req, resp) {
         req.checkParams('value','Invalid token value').isUUID();
         var errors = req.validationErrors();
         if (errors) {
            var data = {errors: errors};
            resp.json(data);
            return;
         }

         Token.findByValue(req.params.value, function(errors,token) {
            if (errors) {
               var data = {errors: errors};
               resp.json(data);
               return;
            }
            if (token.post_id !== null) {
               Post.findById(token.post_id, function(errors,post) {
                  if (errors) {
                     var data = {errors: errors};
                     resp.json(data);
                     return;
                  }
                  post.verify()
                  post.save(function(errors,post) {
                     var data = {};
                     if (errors){
                        data.errors = errors;
                     }
                     data.post = post;
                     setSession(req.session,token.email)
                     resp.json(data);
                  })
               });
            } else {
               setSession(req.session,token.email)
               var data = {};
               resp.json(data);
            }
         })
      });

 function setSession(session,email) {
   session.email = email;
   var adminEmails = process.env.ADMIN_EMAILS.split(',');
   if (adminEmails) {
      for (var i = 0; i < adminEmails; i++) {
          if (adminEmails[i] == email) {
            session.admin == true;
            break;
          };

      }
   }
 }

module.exports = router;
