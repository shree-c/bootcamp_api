const Reviews = require('../models/Reviews');
/*
for pagination and select functionality
this function take db model and a field to populate and returns a function for router
*/

/*
there is a bug
if page < 0 is supplied as parameter to url
there is log of cannot read prop of undefined on console
the server gets stuck
*/
exports.advancedResults = (model, populate) => async (req, res, next) => {
    //copying query object because it now contains some fields that cannot be used for querying
    const queryObj = { ...req.query };
    //we want to delete select, and sort key in object because we need it for filtering but not querying
    const deleteFields = ['select', 'sort', 'page', 'limit'];
    deleteFields.forEach(val => delete queryObj[val]);

    //replacing operators such as lt with $lt etc
    const queryStr = JSON.stringify(queryObj).replace(/\b(gt|eq|gte|lt|lte|in)\b/g, match => `$${match}`);

    //building query
    let query = model.find(JSON.parse(queryStr));
    //we are modifying the query as we go down
    //if select field exist
    if (req.query.select) {
        //converting select key's comma seperated values to space seperated string
        const selectstr = req.query.select.split(',').join(' ');
        query = query.select(selectstr);
    }
    //if sorting is given
    //-key would sort in opposite order
    if (req.query.sort) {
        //converting select key's comma seperated values to space seperated string
        const sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    } else {
        //default: descending created at
        query = query.sort('-createdAt');
    }
    //populating with virtual course field
    //if populate is passed 
    if (populate) {
        query = query.populate(populate);
    }
    //pagination
    const page = parseInt(req.query.page, 10) || 1; //converting to number
    const limit = parseInt(req.query.limit, 10) || 25;
    const no_of_docs_to_skip = (page - 1) * limit; //how many documents to skip
    query = query.skip(no_of_docs_to_skip).limit(limit);
    const no_of_docs_inc_cur_page = page * limit;
    const total = await model.countDocuments();
    //making query to db
    const results = await query;
    //adding pagination info to the sending document
    console.log(page, limit);
    const pagination = {};
    if (no_of_docs_inc_cur_page < total) {
        pagination.next = {
            page: page + 1,
            limit,
        };
    }
    if (no_of_docs_to_skip > 0 && no_of_docs_to_skip < total) {
        pagination.pre = {
            page: page - 1,
            limit
        };
    }
    //setting the result on res object for route callbacks to access
    res.advancedResults = {
        success: true,
        count: results.length,
        data: results,
        pagination,
    };
    next();
};
//a advanced results function for reviews
exports.advancedReviewResults = async (req, res, next) => {
    //copying query object because it now contains some fields that cannot be used for querying
    const queryObj = { ...req.query, ...req.params };
    //we want to delete select, and sort key in object because we need it for filtering but not querying
    const deleteFields = ['select', 'sort', 'page', 'limit'];
    deleteFields.forEach(val => delete queryObj[val]);

    //replacing operators such as lt with $lt etc
    const queryStr = JSON.stringify(queryObj).replace(/\b(gt|eq|gte|lt|lte|in)\b/g, match => `$${match}`);

    //building query
    let query = Reviews.find(JSON.parse(queryStr));
    //we are modifying the query as we go down
    //if select field exist
    if (req.query.select) {
        //converting select key's comma seperated values to space seperated string
        const selectstr = req.query.select.split(',').join(' ');
        query = query.select(selectstr);
    }
    //if sorting is given
    //-key would sort in opposite order
    if (req.query.sort) {
        //converting select key's comma seperated values to space seperated string
        const sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    } else {
        //default: descending created at
        query = query.sort('-createdAt');
    }
    //populating with virtual course field
    //if populate is passed 
    //pagination
    const page = parseInt(req.query.page, 10) || 1; //converting to number
    const limit = parseInt(req.query.limit, 10) || 25;
    const no_of_docs_to_skip = (page - 1) * limit; //how many documents to skip
    query = query.skip(no_of_docs_to_skip).limit(limit);
    const no_of_docs_inc_cur_page = page * limit;
    const total = await Reviews.countDocuments(req.query);
    //making query to db
    const results = await query;
    //adding pagination info to the sending document
    const pagination = {};
    if (no_of_docs_inc_cur_page < total) {
        pagination.next = {
            page: page + 1,
            limit,
        };
    }
    if (no_of_docs_to_skip > 0 && no_of_docs_to_skip < total) {
        pagination.pre = {
            page: page - 1,
            limit
        };
    }
    //setting the result on res object for route callbacks to access
    res.advancedResults = {
        success: true,
        count: results.length,
        data: results,
        pagination,
    };
    next();
};
