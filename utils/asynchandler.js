function async_handler(fn) {
    //returns a function which returns a promise
    return (req, res, next) => {
        return Promise.resolve(fn(req, res, next))
            .catch(next);
    };
}

module.exports = async_handler;