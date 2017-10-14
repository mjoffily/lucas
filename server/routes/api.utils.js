var conn = require('./api.connect');
var controller = require('./api.controller');
var constants = require('./api.constants')
var Promise = require('es6-promise').Promise;

function methodUnderTest() {
    return new Promise(function(resolve, reject) {
        controller.doSomething().then(function(value) { 
            console.log("level 1 - works " + value);
            controller.anotherMethod() // called within resolution of another promise
                .then(function(value2) {
                    console.log("level 2 - works " + value2);
                    resolve(value);
                    
                })
                .catch(function(err) {
                    console.log("Fail again " + err.reason);
                    reject(err);
                });
        })
        .catch(function(err) {
            console.log("Rejected: " + err.reason);
            reject(err);
        });
        
    });
}

function getGoogleRate(sourceCurrency, targetCurrency) {
    return new Promise(function (resolve, reject) {
        controller.getExchangeRateExternal(sourceCurrency, targetCurrency)
        .then(function(exchangeRate) {
            // save the latest rate to the cache
            conn.saveExchangeRate(sourceCurrency, targetCurrency, exchangeRate)
            .then(function() {
                var exchangeRateObj = {exchangeRate: exchangeRate, rateAgeInMinutes: 0, retrievedFrom: "external"};
                console.log(JSON.stringify(exchangeRateObj));
                resolve(exchangeRateObj);
                return;
            })
            .catch(function(err) {
                console.error(JSON.stringify(err, null, 2));
                reject(err);
            })
        })
        .catch(function(err) {
            // just propagate the rejection
            reject(err);
        });
    });        
}

function getCrossRates(sourceCurrency, targetCurrency) {
    return new Promise(function(resolve, reject) {
        var crossRate = 0.00;
        var p1 = getGoogleRate("USD", sourceCurrency);
        var p2 = getGoogleRate("USD", targetCurrency);
        Promise.all([p1, p2])
        .then(values => {
            console.log("Cross rates (USD/" + sourceCurrency + ") and (USD/" + targetCurrency + ") = " + JSON.stringify(values, null, 2));
            crossRate = parseFloat(values[1].exchangeRate) / parseFloat(values[0].exchangeRate);
            conn.saveExchangeRate(sourceCurrency, targetCurrency, crossRate)
            .then(function() {
                var exchangeRateObj = {exchangeRate: crossRate, rateAgeInMinutes: 0, retrievedFrom: "external"};
                console.log("getCrossRates - Resolving - rate: " + JSON.stringify(exchangeRateObj, null, 2));
                resolve(exchangeRateObj);
                return;
            })
            .catch(function(err) {
                // TODO - what to do if we cannot save? Continue probably...
                console.error(JSON.stringify(err, null, 2));
                reject(err);
            })
        })
        .catch(function(err) {
            reject(err);
        });
    })
}
function getExchangeRateLocal(sourceCurrency, targetCurrency) {
  return new Promise(function (resolve, reject) {
      // try to find if exchange rate for this currency pair has been retrieved less than 1 hour ago.
      // Use that exchange rate if so.
      conn.findExhangeRateWithinTheHour(sourceCurrency, targetCurrency)
      .then(function(exchangeRateObj) {
          console.log("Found exchange rate cached: " + exchangeRateObj.exchangeRate);
         resolve(exchangeRateObj);
      })
      .catch(function(err) {
          // if the rejection of the promise was a legit runtime error, reject here
          if (err.code === constants.UNKNOWN_ERROR) {
              reject(err);
          } else { 
              // rejection was because no rates were retrieved in less than 1 hour for this currency pair 
              // search google for the latest rate & save result in the DB
              console.log("Looking for exchange rate on google.com... ");
              getGoogleRate(sourceCurrency, targetCurrency)
              .then(function(obj) {
                  resolve(obj);
              })
              .catch(function(err) {
                if (err.code === constants.NO_EXCHANGE_RATE_FOR_THIS_PAIR) {
                    console.log("No exchange rate found for this pair. Looking for cross rates...")
                    getCrossRates(sourceCurrency, targetCurrency).then(function(exchangeRateObj) {
                        console.log("getExchangeRateLocal - Resolving - Rate: " + JSON.stringify(exchangeRateObj, null, 2));
                        resolve(exchangeRateObj);
                    })
                    .catch(function(err) {
                        reject(err);
                    })
                } else {
                    console.error(err);
                    reject(err);
                }
              });
          }
      });
  })
} 


module.exports = {getExchangeRateLocal: getExchangeRateLocal, methodUnderTest: methodUnderTest};