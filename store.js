// const Store = require("./store")

// import redis from "ioredis";
const redis = require("ioredis");
const crypto = require("crypto");

const EXPIRATION_IN_SECONDS = process.env.SESSION_TTL_SECONDS ?? 900000;

module.exports = class RedisStore {
  options = {};

  sessionPrefix = "sess_";

  sessionId = null;

  constructor(sessionId = null) {
    this.sessionId = sessionId;
    // this.storage = new Map();
    this.redisClient = redis.createClient({
      host: process.env.SESSION_REDIS_HOST ?? "redis",
    });
  }

  create(data, callback = null) {
    if (this.sessionId === null) {
      const token = crypto.randomBytes(16).toString("hex");
      console.log("Creating with data");
      console.log(JSON.stringify(data));
      this.sessionId = token;
      this.redisClient.set(
        this.sessionPrefix + token,
        JSON.stringify(data),
        "EX",
        EXPIRATION_IN_SECONDS
      );

      if (callback) {
        callback(token);
      } else {
        return token;
      }
    } else throw new Error("Already owns a session");
  }

  destroy(callback) {
    console.log("Destroy " + this.sessionPrefix + this.sessionId);
    this.redisClient.del(this.sessionPrefix + this.sessionId);
    this.sessionId = null;
    callback(null);
  }

  update(session) {
    console.log("updating with data");
    console.log(session);
    // if (session )
    this.redisClient.set(
      this.sessionPrefix + this.sessionId,
      JSON.stringify(session),
      "EX",
      EXPIRATION_IN_SECONDS
    );
  }

  getSession(callback) {
    // return
    this.redisClient.get(this.sessionPrefix + this.sessionId, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Result: " + result + " " + this.sessionId);
        callback(Boolean(result) ? JSON.parse(result) : {});
      }
      
      /*let s = null;
      try {
        console.log("result " + result);
        s = JSON.parse(result);
      } catch (e) {
        console.log(e);
        s = {};
      }*/
    });
  }

  sessionExists() {
    return new Promise((res) => {
/*       if (this.sessionId === null) res(false);
      this.redisClient.exists(this.sessionPrefix + this.sessionId)
      .then(e => {
        console.log("Exists: " + e);
        res(Boolean(e));
      }); */

      if (this.sessionId === null) res(false);
      this.redisClient.get(this.sessionPrefix + this.sessionId, (err, data) => {
        console.log("DATA: " + data);
        res(Boolean(data));
      });
    });
  }

  touch() {
    // this.update(session);
    this.redisClient.expire(this.sessionPrefix + this.sessionId, EXPIRATION_IN_SECONDS);
  }
}

module.exports.EXPIRATION_IN_SECONDS = EXPIRATION_IN_SECONDS;
