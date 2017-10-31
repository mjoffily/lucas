var Promise = require('bluebird');
var MongoDB = require('mongodb');
var constants = require('./api.constants')
var MongoClient = MongoDB.MongoClient;
Promise.promisifyAll(MongoDB);

const EXCHANGE_RATES = "xrcollection";
const REQUESTS = "requests";
var myDb;


function connect() {
  return new Promise(function (resolve, reject) {
    if (myDb === undefined) {
      MongoClient.connectAsync('mongodb://127.0.0.1:27017/coin').then(function(db) {
        myDb = db;
        resolve(myDb);
      })
      .catch(function(err) {
        reject(err);
      });  
    } else {
      resolve(myDb);
    }
  });
}

function saveExchangeRate(sourceCurrency, targetCurrency, exchangeRate) {
   return new Promise(function (resolve, reject) {
     connect()
     .then(function(db) {
        db.collection(EXCHANGE_RATES).insertAsync({currencySource:sourceCurrency,currencyTarget: targetCurrency, currencyPair:(sourceCurrency + targetCurrency), exchangeRate: exchangeRate, lastUpdate: (new Date())})
        .then(function() {
          resolve("ok");
        })
        .catch(function(err) {
          reject(err);
        })
     })
     .catch(function(err) {
       reject(err);
     })
   });
}

function saveRequest(query, headers, ipAddress) {
   return new Promise(function (resolve, reject) {
     console.log("[saveRequest] - START");
     connect()
     .then(function(db) {
        db.collection(REQUESTS).insertAsync({ipAddress: ipAddress, query: query, headers: headers, when: new Date()})
        .then(function() {
          console.log("[saveRequest] - END (ok)");
          resolve("ok");
        })
        .catch(function(err) {
          console.log("[saveRequest] - END (error)");
          reject(err);
        })
     })
     .catch(function(err) {
       reject(err);
     })
   });
}

function findExhangeRateWithinTheHour(sourceCurrency, targetCurrency) {
  return new Promise(function (resolve, reject) {
    console.log("[findExhangeRateWithinTheHour] - Getting saved exchange rate for currency pair: " + sourceCurrency + targetCurrency);
    connect()
    .then(function(db) {
        console.log("[findExhangeRateWithinTheHour] - connect has worked ");
        return db.collection(EXCHANGE_RATES).find({"currencyPair": sourceCurrency+targetCurrency }).sort({"lastUpdate": -1}).limit(1).toArrayAsync();
    })
    .then(function(items) {
      if (items && items[0])  {
        console.log('[findExhangeRateWithinTheHour] - these are the itemss: ' + JSON.stringify(items[0]));
        console.log(items[0].lastUpdate);
        var currentTimeStr = new Date().toGMTString();
        var timeElapsedInMinutes = (Date.parse(currentTimeStr) - Date.parse(items[0].lastUpdate)) / 1000 / 60;
        if (timeElapsedInMinutes > 60) {
          console.log("[findExhangeRateWithinTheHour] - REJECTING CACHED RATE - time elapsed since last rate retrieval: " + timeElapsedInMinutes);
          reject({message: "cache expired", code: constants.CACHE_EXPIRED})
        }
        
        resolve({exchangeRate: items[0].exchangeRate, rateAgeInMinutes: timeElapsedInMinutes, retrievedFrom: "cache"});
      } else {
        console.log("[findExhangeRateWithinTheHour] - No exchange rate found in cache for " + sourceCurrency + targetCurrency);
        reject({message: "no exchange rate found", code: constants.NO_EXCHANGE_RATE_FOR_THIS_PAIR})
      }
      return;
    })
    .catch(function(err) {
      console.error(err);
      reject({message: "no exchange rate found", code: constants.UNKNOWN_ERROR})
    });

  })
}

function showRequests(minutes) {
  return new Promise(function (resolve, reject) {
    console.log("[showRequests] - START - Retrieving requests for the last " + minutes + " minutes");
    connect()
    .then(function(db) {
        console.log("[showRequests] - connect has worked ");
        return db.collection(REQUESTS).find({when: {$gte: (new Date(new Date().getTime() - 1000 * minutes * 60)) } }).sort({"lastUpdate": -1}).toArrayAsync();
    })
    .then(function(items) {
      if (items && items[0])  {
        //return console.log('these are the itemss: ' + JSON.stringify(items[0]));
        console.log(items[0].lastUpdate);
        var currentTimeStr = new Date().toGMTString();
        var timeElapsedInMinutes = (Date.parse(currentTimeStr) - Date.parse(items[0].lastUpdate)) / 1000 / 60;
        if (timeElapsedInMinutes > 60) {
          console.log("REJECTING CACHED RATE - time elapsed since last rate retrieval: " + timeElapsedInMinutes);
          reject({message: "cache expired", code: constants.CACHE_EXPIRED})
        }
        
        resolve({data: items});
      } else {
        console.log("[showRequests] - No requests found in the last " + minutes + " minutes");
        resolve({data: []});
      }
      return;
    })
    .catch(function(err) {
      console.error("[showRequests] - ERROR: " + [showRequests] - err);
      reject({message: "Error retrieving requests", code: constants.UNKNOWN_ERROR})
    });

  })
}

module.exports = {connect: connect, findExhangeRateWithinTheHour: findExhangeRateWithinTheHour
, saveExchangeRate: saveExchangeRate
, saveRequest: saveRequest
, showRequests: showRequests};