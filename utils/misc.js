/**
 * calculates average of a property from an array
 * @param {String} prop 
 * @param {Array} arr 
 * @returns number
 */
exports.average = function (prop, arr) {
    return (arr.reduce((prev, curr) => prev + curr[prop], 0)) / arr.length;
};

