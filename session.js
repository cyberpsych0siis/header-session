"use strict";

import crypto from 'crypto';

import RedisStore from './store.js';

const memoryStorage = new Map();

export default function session(redisClient) {
  return function hmm(req, res, next) {
    if (req.url === "/health" || req.session) {
      next();
      return;
    }

    const sid = req.headers["x-session"] ?? null;

    req.sessionID = sid;
    
    if (!sid) {
      debug("no SID sent, generating session");
    //  generate();
      req.sessionID = "proxy didnt send x-session header";
      req.sessionStore = {
        getSession: function(cb) {
          cb(memoryStorage.get("invalid_session") ?? {});
        },
        update: function(session) {
          //noop, lulz
          memoryStorage.set("invalid_session", session);
        }
      }
      //next();
      //return;
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
