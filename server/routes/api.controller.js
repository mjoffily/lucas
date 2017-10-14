'use strict';

var Promise = require('es6-promise').Promise;
var google = require('../../node_modules/googleapis/lib/googleapis.js');
var constants = require('./api.constants')


//TODO remove this method
function doSomething() {
    return new Promise(function(resolve, reject) {
       resolve("doSomething real value"); 
    });
}

//TODO remove this method
function anotherMethod() {
    return new Promise(function(resolve, reject) {
        resolve("another method real value");
    });    
}

function getExchangeRateExternal(sourceCurrency, targetCurrency) {
    return new Promise(function (resolve, reject) {
          console.log("getExchangeRateExternal - looking for rate for " + sourceCurrency + targetCurrency + " pair...");
          // Call API to retrieve exchange rate
          var customsearch = google.customsearch('v1');
          var queryString = '1+' + sourceCurrency + '+to+' + targetCurrency
          var currencyPair = sourceCurrency + targetCurrency;
        
          // API Details          
          const CX = '004065446796459763735:mlqrh0wzros';
          const API_KEY = 'AIzaSyBoq2eKA4tUmVXztAkT0m1Uu6YR5BC22yE';
          const SEARCH = queryString;
          
          customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY }, function (err, resp) {
            if (err) {
              reject(new Error(err));
              return;
            } 
            
            //console.log(JSON.stringify(resp, null, 2));
            for (let item of resp.items) {
            
                if (!item.pagemap) {
                  continue;
                }
                if (!item.pagemap.financialquote) {
                  continue;
                }
                
                var curPair = item['pagemap']['financialquote'][0]['name']
                console.log('Testing current pair ' + curPair);
                if (curPair === currencyPair) {
                  var rate = item['pagemap']['financialquote'][0]['price'];
                  console.log('exchange rate found: ' + rate);
                  resolve(rate);
                  return;
                }
            }
            var error = new Error("could not find exchange rate for " + currencyPair);
            error.code = constants.NO_EXCHANGE_RATE_FOR_THIS_PAIR;
            reject(error);
          });
    });
}

module.exports = {getExchangeRateExternal: getExchangeRateExternal};
