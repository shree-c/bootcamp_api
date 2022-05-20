const errorHandler = (err, req, res, next) => {
    console.log(err);
    if (err.name === 'CastError') {
        //incorrect format
        err.message = `data not found with id: ${err.value}`;
        err.statusCode = 404;
    }
    //duplicate field
    if (err.code === 11000) {
        err.message = `duplicate field: ${JSON.stringify(err.keyValue)}`;
        err.statusCode = 400;
    }
    //calidation error
    if (err.name === 'ValidationError') {
        err.message = Object.values(err.errors).map((val) => val.message);
        err.statusCode = 400;
    }
    //sending response
    res.status(err.statusCode || 500).json({
        success: false,
        error: `${err.message}` || 'server error'
    });
};

module.exports = errorHandler;
