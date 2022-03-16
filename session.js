"use strict";

import crypto from 'crypto';

import RedisStore from './store.js';

const memoryStorage = [];

export default function session() {
  return function hmm(req, res, next) {
    if (req.url === "/health" || req.session) {
      next();
      return;
    }

    const sid = req.headers["x-session"] ?? null;

    req.sessionID = sid;
    
    if (!sid) {
      debug("no SID sent, generating session");
      req.sessionID = memoryStorage.length;
      memoryStorage.push({
        memoryStored: true
      });
    //  generate();
//      req.sessionID = "proxy didnt send x-session header";
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
      
      //write to cookie
      if (req.session.memoryStored) {
        res.setHeader("Set-Cookie", "memorySession=" + req.sessionID);
      }
      
      end.call(res, chunk, encoding);
    }
  }
}

function getCookieSessionId(req) {
  
}
