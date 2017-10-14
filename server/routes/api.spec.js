var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinon = require('sinon');
var utils = require('./api.utils');
var conn = require('./api.connect');
var controller = require('./api.controller');
var constants = require('./api.constants');
//var app = require('../../server');
var chaiHttp = require('chai-http');

chai.should();
var Promise = require('es6-promise').Promise;
//chai.use(chaiHttp);

// function getMethods(obj) {
//   var result = [];
//   for (var id in obj) {
//     try {
//       if (typeof(obj[id]) == "function") {
//         result.push(id + ": " + obj[id].toString());
//       }
//     } catch (err) {
//       result.push(id + ": inaccessible");
//     }
//   }
//   return result;
// }

describe('Promises', function() {
  var sourceCurrency = "USD";
  var targetCurrency = "BRL";
  var connMock;

  beforeEach(function() {
    connMock = sinon.mock(conn);
  });

  afterEach(function() {
    connMock.restore();
  })
        
  it("should return exhange rate from DB when there is an entry retrieved less than 1 hour ago", function(done) {

      const EXCHANGE_RATE = 3.5;
      connMock.expects('findExhangeRateWithinTheHour').once().withArgs(sourceCurrency, targetCurrency).resolves(EXCHANGE_RATE);
      console.log("testing: ");
      var rate;
      // method under test
      utils.getExchangeRateLocal(sourceCurrency, targetCurrency).should.eventually.equal(3);
        connMock.restore();
        connMock.verify();
        console.log("here");
        done();


  });
        
  it("should fail when findExhangeRateWithinTheHour throws UNKNOWN_ERROR", function(done) {

      var connMock = sinon.mock(conn);
      connMock.expects('findExhangeRateWithinTheHour').once().withArgs(sourceCurrency, targetCurrency)
        .rejects({code: constants.UNKNOWN_ERROR});

      // method under test
      utils.getExchangeRateLocal(sourceCurrency, targetCurrency).then(function(rate) {
        sinon.assert.fail("An exception should have been thrown");
      })
      .catch(function(err) {
        sinon.assert.pass();
      });

      connMock.restore();
      connMock.verify();
      done();

  });
  
  describe("When google API is called", function() {
      
    it("should return the GOOGLE exchange rate if no results in DB in the last hour", function(done) {
  
        var connMock = sinon.mock(conn);
        var googleAPIStub = sinon.mock(controller);
        connMock.expects('findExhangeRateWithinTheHour').once().withArgs(sourceCurrency, targetCurrency).rejects({code: constants.NO_EXCHANGE_RATE_FOR_THIS_PAIR});
        googleAPIStub.expects('getExchangeRateExternal').once().withArgs(sourceCurrency, targetCurrency).resolves(5.05);
  
        // method under test
        utils.getExchangeRateLocal(sourceCurrency, targetCurrency).then(function(rate) {
          connMock.restore();
          googleAPIStub.restore();
          connMock.verify();
          googleAPIStub.verify();
          sinon.assert.pass();
        })
        .catch(function(err) {
            sinon.assert.fail("No error should have occurred");
        });
  
        done();
  
    });
  })      
  
 });
    
