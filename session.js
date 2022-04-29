const RedisStore = require("./RedisStore.js");

module.exports = (req, res, next) => {
    //middleware goes here

    const sid = req.headers["x-session"];
    req.session = {};
    
    if (sid) {

        req.sessionStore = new RedisStore(sid);

        const proxiedEnd = res.end;

        console.log("Session Id: " + sid);

        res.end = (chunk, encoding) => {
            console.log("end of request");
            req.sessionStore.update(req.session);
            proxiedEnd.call(res, chunk, encoding);
        }
        
        req.sessionStore.getSession((data) => {
            req.session = data;
            next();
        });
    } else {
        next();
    }
}