// const Store = require("./store")

export default class RedisStore {
  options = {};

  sessionPrefix = "sess_";

  constructor(redisClient, sessionId) {
    // for (let i = 0; i < Object.keys(options); i++) {}
    // this.redis = redis;
    // super();

    this.sessionId = sessionId;
    // this.storage = new Map();
    this.redisClient = redisClient;
  }

  create(callback) {
    // module.exports.createNewSessionToken = function (timeoutInSeconds) {
    if (this.sessionId === null) {
      const token = crypto.randomBytes(16).toString("hex");
      this.redisClient.set(this.sessionPrefix + token, "{}");
      // };
      // this.redisClient;
      this.sessionId = token;
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
      JSON.stringify(session)
    );
  }

  getSession(callback) {
    // return
    this.redisClient.get(this.sessionPrefix + this.sessionId).then((result) => {
      //   console.log(arguments);
      callback(JSON.parse(result) ?? {});
    });
  }

  async sessionExists() {
    return await this.redisClient.exists(this.sessionPrefix + this.sessionId);
  }

  //TODO Implement TTL Touch
  /*   touch(sid, session, callback) {
    // console.log(sid, session);
    callback(null);
  } */
}
