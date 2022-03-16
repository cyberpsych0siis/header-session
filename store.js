// const Store = require("./store")

import redis from "ioredis";

export const EXPIRATION_IN_SECONDS = process.env.SESSION_TTL_SECONDS ?? 900000;

export default class RedisStore {
  options = {};

  sessionPrefix = "sess_";

  constructor(sessionId = null) {
    // for (let i = 0; i < Object.keys(options); i++) {}
    // this.redis = redis;
    // super();

    this.sessionId = sessionId;
    // this.storage = new Map();
    this.redisClient = redis.createClient({
      host: process.env.SESSION_REDIS_HOST ?? "redis",
    });
  }

  create(callback) {
    // module.exports.createNewSessionToken = function (timeoutInSeconds) {
    if (this.sessionId === null) {
      const token = crypto.randomBytes(16).toString("hex");
      this.redisClient.set(
        this.sessionPrefix + token,
        "{}",
        "EX",
        EXPIRATION_IN_SECONDS
      );
      // };
      // this.redisClient;
      this.sessionId = token;
      // this.ttl = ttl;
      callback(token);
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
      callback(JSON.parse(result) ?? {});
    });
  }

  sessionExists() {
    //return this.sessionId !== null && await this.redisClient.exists(this.sessionPrefix + this.sessionId) === 0;
    return new Promise((res) => {
      if (this.sessionId === null) res(0);
      return this.redisClient.exists(this.sessionPrefix + this.sessionId);
    });
  }

  //TODO Implement TTL Touch
  touch(session, callback) {
    this.update(session);
    // callback(null);
  }
}
