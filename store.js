// const Store = require("./store")

// import redis from "ioredis";
const redis = require("ioredis");
const crypto = require("crypto");

const EXPIRATION_IN_SECONDS = process.env.SESSION_TTL_SECONDS ?? 900000;
module.exports.EXPIRATION_IN_SECONDS = EXPIRATION_IN_SECONDS;

module.exports = class RedisStore {
  options = {};

  sessionPrefix = "sess_";

  constructor(sessionId = null) {
    this.sessionId = sessionId;
    // this.storage = new Map();
    this.redisClient = redis.createClient({
      host: process.env.SESSION_REDIS_HOST ?? "redis",
    });
  }

  create(data = {}, callback = null) {
    if (this.sessionId === null) {
      const token = crypto.randomBytes(16).toString("hex");
      this.redisClient.set(
        this.sessionPrefix + token,
        JSON.stringify(data),
        "EX",
        EXPIRATION_IN_SECONDS
      );
      // };
      // this.redisClient;
      this.sessionId = token;
      // this.ttl = ttl;
      if (callback) callback(token);
    } else throw new Error("Already owns a session");
  }

  destroy(callback) {
    console.log("Destroy " + this.sessionPrefix + this.sessionId);
    this.redisClient.del(this.sessionPrefix + this.sessionId);
    this.sessionId = null;
    callback(null);
  }

  update(session) {
    // console.log(JSON.stringify(this));
    this.redisClient.set(
      this.sessionPrefix + this.sessionId,
      JSON.stringify(session),
      "EX",
      EXPIRATION_IN_SECONDS
    );
  }

  getSession(callback) {
    // return
    this.redisClient.get(this.sessionPrefix + this.sessionId).then((result) => {
      //   console.log(arguments);

      let s = null;
      try {
        s = JSON.parse(result);
      } catch (e) {
        s = {};
      }
      callback(s);
    });
  }

  sessionExists() {
    return new Promise((res) => {
      if (this.sessionId === null) res(0);
      const exists = this.redisClient.exists(this.sessionPrefix + this.sessionId);
      exists.then(e => {
        res(e !== 0);
      });
    });
  }

  touch(session, callback) {
    this.update(session);
  }
}
