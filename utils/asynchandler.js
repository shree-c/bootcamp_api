function async_handler(fn) {
    return (req, res, next) => {
        return Promise.resolve(fn(req, res, next))
            .catch(next);
    };
}

module.exports = async_handler;