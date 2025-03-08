module.exports = {
    jwt: {
        secret: process.env.AUTH_HASH || "default",
        expiresIn: "1d"
    }
}