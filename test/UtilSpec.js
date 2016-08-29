var expect = require("chai").expect;
var utils = require("../utils.js");

describe('parse filter params via getFilterParams', function() {

	var VALID_FILTERS = {category: 'string', rating: 'int', test: 'string'};

  it('should pull out a valid param', function() {
    var validParam = {category: "Pasta Sauce"};
    expect(utils.getFilterParams(validParam, VALID_FILTERS)).to.deep.equal(validParam);
  });
  it('should return multiple valid params', function() {
    var mutipleValidParams = {category: "Pasta Sauce", test: "test"};
    expect(utils.getFilterParams(mutipleValidParams, VALID_FILTERS)).to.deep.equal(mutipleValidParams);
  });
  it('should not return invalid param', function() {
    // assertions here
    var invalidParams = {foo: "bar"};
    expect(utils.getFilterParams(invalidParams, VALID_FILTERS)).to.deep.equal({});
  });
  it('should return number param properly', function() {
    var numParam = {rating: "9"};
    expect(utils.getFilterParams(numParam, VALID_FILTERS)).to.deep.equal({rating: 9});
  });
});