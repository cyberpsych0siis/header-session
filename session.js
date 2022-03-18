"use strict";

// import crypto from 'crypto';

// import RedisStore from './store.js';
const RedisStore = require('./store.js');
const memoryStorage = [];

module.exports = function session() {
  return function hmm(req, res, next) {
    if (req.url === "/health" || req.session) {
      next();
      return;
    }

    const sid = req.headers["x-session"] ?? null;

    req.sessionID = sid;
    
    if (!sid) {
      console.log("no SID sent, generating session");
      req.sessionID = memoryStorage.length;
      memoryStorage.push({
        memoryStored: true
      });
      
      req.sessionStore = {
        getSession: function(cb) {
          cb(memoryStorage[req.sessionID]);
        },
        update: function(session) {
          //noop, lulz
          //memoryStorage.set("invalid_session", session);
          memoryStorage[req.sessionID] = session;
        }
      }
      //next();
      //return;
    } else {
      req.sessionStore = new RedisStore(sid);
      // console.log(req.sessionStore);
    }
    // req.session =

    const end = res.end;
    
    res.end = (chunk, encoding) => {
      
      // const currentHash = crypto.createHash('md5').update(JSON.stringify(req.session)).digest('hex');
      console.log("Session in middleware");
      console.log(req.session);
      req.sessionStore.update(req.session);
      
      //write to cookie
      if (req.session.memoryStored) {
        res.setHeader("Set-Cookie", "memorySession=" + req.sessionID);
      }
      
      end.call(res, chunk, encoding);
    }

    req.sessionStore.getSession((data) => {
      console.log("Session Data: ");
      console.log(data);
      req.session = data;
      next();
      // return;
    });
  }
}

/*function getCookieSessionId(req) {
  
}*/
