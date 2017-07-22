"use strict";
// JSON -> JSON
function myAssign(obj1, obj2) {
    var rv = {};
    Object.getOwnPropertyNames(obj2).forEach(function (name) {
        rv[name] = obj2[name];
    });
    Object.getOwnPropertyNames(obj1).forEach(function (name) {
        rv[name] = obj1[name];
    });
    return rv;
}
module.exports = function (inputJSON) {
    return myAssign(inputJSON, {});
};
