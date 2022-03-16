"use strict";

import crypto from 'crypto';

import RedisStore from './store.js';

export default function session(redisClient) {
  return function hmm(req, res, next) {
    if (req.url === "/health" || req.session) {
      next();
      return;
    }

    const sid = req.headers["x-session"] ?? null;

    req.sessionID = sid;
    
    if (!req.sessionID) {
      debug("no SID sent, generating session");
    //  generate();
      req.sessionStore = {
        getSession: function(cb) {
          cb({});
        },
        update: function(session) {
          //noop, lulz
        }
      }
      next();
      return;
    } else {
      req.sessionStore = new RedisStore(sid);
    }
    // req.session =
      
    req.sessionStore.getSession((data) => {
      console.log(data);
      req.session = data;
      next();
      // return;
      });

    const end = res.end;
    
    res.end = function (chunk, encoding) {
      
      // const currentHash = crypto.createHash('md5').update(JSON.stringify(req.session)).digest('hex');
        
      req.sessionStore.update(req.session);
      end.call(res, chunk, encoding);
    }
  }
}
