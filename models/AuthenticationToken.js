module.exports = class AuthenticationToken {

    /**
     * This response tells the client that the authentication token has changed.
     * If token is null the client knows its token has expired and it should invalidate the local session
     * @param {String?} token 
     */
    constructor(res, token = null) {
        this.module = "auth";
        this.token = token;

        //res.setHeader("Content-Type", "application/json");
        //res.setHeader("X-Token", JSON.stringify(this));
        res.status(token === null ? 403 : 200).send();
    }

    toJSON() {
        return this;
    }
}
