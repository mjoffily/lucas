'use strict';

const express = require('express');
// declare axios for making http requests
const axios = require('axios');
var utils = require('./api.utils');
var exchanges = require('./api.exchanges');
var conn = require('./api.connect');

const router = express.Router();

const COUNTRIES = {'Australia': {'country': 'Australia', 'currencySymbol': 'AUD', 'name': 'Australian Dolar', 'exchanges':[
                     'Independent Reserve']},
                   'Brazil': {'country':'Brazil', 'currencySymbol':'BRL', 'name': 'Brazilian Real', 'exchanges':[
                     'Foxbit', 
                     'BitcoinToYou', 
                     'Mercado Bitcoin', 
                     'CoinBR']},
                   'Chile': {'country':'Chile', 'currencySymbol':'CLP', 'name': 'Chilean Peso', 'exchanges':['ChileBit.NET']},
                   'Pakistan': {'country':'Pakistan', 'currencySymbol':'PKR', 'name': 'Pakistani Rupee', 'exchanges':['UrduBit']},
                   'Philippines': {'country':'Philippines', 'currencySymbol': 'PHP', 'name': 'Philipino Peso', 'exchanges':['Coins.ph']},
                   'Russia': {'country':'Russia', 'currencySymbol':'RUB', 'name': 'Russian Ruble', 'exchanges':['BTC-e']},
                   'South Africa': {'country':'South Africa', 'currencySymbol':'ZAR', 'name': 'South African Rand', 'exchanges':['luno']},
                   'Thailand': {'country':'Thailand', 'currencySymbol':'THB', 'name': 'Thailand Baht', 'exchanges':['Coins.ph (THB)']},
                   'United States': {'country':'United States', 'currencySymbol':'USD', 'name': 'American dolar', 'exchanges':['Coinbase', 'Bitfinex']},
                   'Venezuela': {'country':'Venezuela', 'currencySymbol':'VEF', 'name': 'Venezuelan Bolivar', 'exchanges':['SurBitcoin']},
                   'Vietnam': {'country':'Vietnam', 'currencySymbol':'VND', 'name': 'Vietnamise Dongs', 'exchanges':['VBTC']}
                };

//const API = 'https://jsonplaceholder.typicode.com';
const API = 'https://angular2test-mjoffily.c9users.io:8080';
/* GET api listing. */

//console.log = function() {}


function isSupportedCountry(country, callback) {

  if (COUNTRIES[country]) {
    callback(null, true);
  } else {
    callback(null, false);
  }   
}



function getExchangeRate(sourceCountry, targetCountry, callback) {
  return new Promise(function (resolve, reject) {  
    if (sourceCountry == targetCountry) {
      resolve({ exchangeRate: 1
              , rateAgeInMinutes: 0
              , retrievedFrom: "local"
              });
      return;
    }

  // Check if the source country is supported
    isSupportedCountry(sourceCountry, (err, supported) => {
      if (!supported) {
        console.log('Error: country not supported ' + sourceCountry);
        reject(new Error('source country not supported '));
      } else {
      // Check if the target country is supported
        isSupportedCountry(targetCountry, (err, supported) => {
          if (!supported) {
            reject(new Error('target country not supported '));
          } else {
            utils.getExchangeRateLocal(COUNTRIES[sourceCountry].currencySymbol, COUNTRIES[targetCountry].currencySymbol)
            .then(function(exchangeRate) {
              console.log("getExchangeRate - Resolving - Rate: " + JSON.stringify(exchangeRate, null, 2));
              resolve(exchangeRate);
            })
            .catch(function(err) {
              reject(err);
            })
          }
        });    
      }
    });
  });
}

utils.getExchangeRateLocal("USD", "BRL");
////var isSupportedCountryAsync = Promise.promisify(isSupportedCountry);
// var getExchangeRateAsync = Promise.promisify(getExchangeRate);
// getExchangeRateAsync("Australia", "Brazil").then(function(result) {
//   console.log("this is the resulttt: " + result);
// }).catch(function(err) {
//   console.error("This is the error: " + err);
// });

router.get('/xr', (req, res) => {
  
  if (! req.query.sourceCountry) {
    res.status(400).send({data: [], error: {code: 400, message: 'source currency must be informed '}});
    return;
  }
  
  if (! req.query.targetCountry) {
    res.status(400).send({data: [], error: {code: 400, message: 'target currency must be informed '}});
    return;
  }
  
  var rate = getExchangeRate(req.query.sourceCountry, req.query.targetCountry, (err, data) => {
    if (err) {
      console.log('This is the error: ' + err.message);
      res.status(400).send({data: [], error: {code: 400, message: err.message}});
    } else {
      console.log('this is the rate: ' + data);
      res.status(200).send({rate: data});
    }
    
  });
});


router.get('/', (req, res) => {
  res.send('api is up and running!');
});

// Get all posts
router.get('/posts', (req, res) => {
  // Get posts from the mock api
  // This should ideally be replaced with a service that connects to MongoDB
  axios.get(`${API}/posts`)
    .then(posts => {
      res.status(200).json(posts.data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});

router.get('/countries', (req, res) => {
  // Get posts from the mock api
  // This should ideally be replaced with a service that connects to MongoDB
//  res.send('api works in countries');
  var countries = [];
  for (var key in COUNTRIES) {
  if (COUNTRIES.hasOwnProperty(key)) {
    countries.push(COUNTRIES[key]);
  }
  //console.log(countries);
}
  res.set('Content-Type', 'application/json');
  res.status(200).json(countries);
    
});

router.get('/exchange/independent-reserve', (req, res) => {
  res.set('Content-Type', 'application/json');
  exchgIndependentReserve((err, ir) => {
          if (!err) {
            console.log('voltou: ' + ir);
            res.status(200).json(ir);
          } else {
            console.log('error: ' + err);
            res.status(500).send(err)
          }
        })
});


router.get('/exchange/foxbit', (req, res) => {
  res.set('Content-Type', 'application/json');
  exchgFoxBit((err, ir) => {
          if (!err) {
            console.log('voltou: ' + ir);
            res.status(200).json(ir);
          } else {
            console.log('error: ' + err);
            res.status(500).send(err)
          }
        })
});

router.get('/exchange/coins-ph', (req, res) => {
  res.set('Content-Type', 'application/json');
  exchgCoinsPH((err, ir) => {
          if (!err) {
            console.log('voltou: ' + ir);
            res.status(200).json(ir);
          } else {
            console.log('error: ' + err);
            res.status(500).send(err)
          }
        })
});
  
router.get('/exchange/coins-thb', (req, res) => {
  res.set('Content-Type', 'application/json');
  exchgCoinsTHB((err, ir) => {
          if (!err) {
            console.log('voltou: ' + ir);
            res.status(200).json(ir);
          } else {
            console.log('error: ' + err);
            res.status(500).send(err)
          }
        })
});

router.get('/exchange/btc-e', (req, res) => {
  res.set('Content-Type', 'application/json');
  exchgBTCe((err, ir) => {
          if (!err) {
            console.log('voltou: ' + ir);
            res.status(200).json(ir);
          } else {
            console.log('error: ' + err);
            res.status(500).send(err)
          }
        })
});

router.get('/exchange/luno', (req, res) => {
  res.set('Content-Type', 'application/json');
  exchgLunoZAR((err, ir) => {
          if (!err) {
            console.log('voltou: ' + ir);
            res.status(200).json(ir);
          } else {
            console.log('error: ' + err);
            res.status(500).send(err)
          }
        })
});

router.get('/exchange/coinbase', (req, res) => {
    `
    these coinbase endpoints are a bit counter intuitive.
    The sell endpoint gives you the total price to sell one bitcoin.
    In other words, the highest BID price.
    The buy endpoint is the other way around. It gives you the total price to buy
    one bitcoin, or the Lowest Ask price.
    `
  res.set('Content-Type', 'application/json');
  exchgCoinbaseUSD((err, ir) => {
          if (!err) {
            console.log('voltou: ' + ir);
            res.status(200).json(ir);
          } else {
            console.log('error: ' + err);
            res.status(500).send(err)
          }
        })
});

router.get('/request-list', (req, res) => {
  var minutes = req.query.minutes
  if (! minutes) {
    minutes = 10;
  }
  
  conn.showRequests(minutes).then(function(data) {
    res.status(200).json(data);
    return;
  })
  .catch(function(error) {
    res.status(500).send(error);
    return;
    
  })
  
});

function format2(currency, n) {
  return new Promise(function (resolve, reject) {
    if (!currency) {
      currency = "";
    }
//    console.log("this is n: " + n + " typeof n: " + typeof n);
    resolve(currency + " " + parseFloat(n).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,"));
  })
}

router.get('/arbitrage', (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  conn.saveRequest(req.query, req.headers, ip).then(function() {
    console.log("Request saved");
  })
  .catch(function(error) {
    console.log("/arbitrage - ERROR saving request to database " + error);
  });
  // console.log(req.query);
  if ( (!req.query.sourceCountry) || (!COUNTRIES[req.query.sourceCountry]) ) {
    res.status(400).send({data: [], error: {code: 400, message: 'source country is blank or not supported '}});
    return;
  }
  
  if ( (!req.query.targetCountry) || (!COUNTRIES[req.query.targetCountry])) {
    res.status(400).send({data: [], error: {code: 400, message: 'target country is blank or not supported '}});
    return;
  }
  
  if ((! req.query.sourceExchange) || (!exchanges.EXCHANGES[req.query.sourceExchange])) {
    res.status(400).send({data: [], error: {code: 400, message: 'source exchange is blank or not supported '}});
    return;
  }

  if ((! req.query.targetExchange) || (!exchanges.EXCHANGES[req.query.targetExchange])) {
    res.status(400).send({data: [], error: {code: 400, message: 'target exchange is blank or not supported '}});
    return;
  }

  if (COUNTRIES[req.query.sourceCountry].exchanges.indexOf(req.query.sourceExchange) === -1) {
    res.status(400).send({data: [], error: {code: 400, message: 'source exchange not valid for country ' + req.query.sourceCountry }});
    return;
  }

  if (COUNTRIES[req.query.targetCountry].exchanges.indexOf(req.query.targetExchange) === -1) {
    res.status(400).send({data: [], error: {code: 400, message: 'target exchange not valid for country ' + req.query.targetCountry }});
    return;
  }
  
  var sourceCountry = req.query.sourceCountry;
  var targetCountry = req.query.targetCountry;
  var sourceExchange = req.query.sourceExchange;
  var targetExchange = req.query.targetExchange;
  
  var baseAmount = 1000;
  if (req.query.amount) {
    baseAmount = req.query.amount;
  }
  
  var exchangeRate = 1.0;
  var amountAtSpotRate = baseAmount;
  

  var numberOfBitcoinsBoughtAtOrigin = 0;
  var amountInDestinationCurrencyAfterSale = 0.0;
  
  var promises = [];
  promises[0] = exchanges.EXCHANGES[sourceExchange]();
  promises[1] = exchanges.EXCHANGES[targetExchange]();
  promises[2] = getExchangeRate(sourceCountry, targetCountry);
  
  Promise.all(promises)
  .then(results => {
    var sourceBTCMarketPrice = results[0];
    var targetBTCMarketPrice = results[1];
    var exchangeRateObj = results[2];
    console.log("results: " + JSON.stringify(results, null, 2));
    
    numberOfBitcoinsBoughtAtOrigin = baseAmount / sourceBTCMarketPrice['currentLowestOfferPrice'];
    console.log('Number of bitcoins bought at source ' +  numberOfBitcoinsBoughtAtOrigin);

    amountInDestinationCurrencyAfterSale = numberOfBitcoinsBoughtAtOrigin * targetBTCMarketPrice['currentHighestBidPrice']
    console.log('Amount after bitcoin sale in target country ' +  amountInDestinationCurrencyAfterSale);
    
    var formatPromises = [];
    var r = {}
    r['currencyPair'] = COUNTRIES[sourceCountry].currencySymbol + "/" + COUNTRIES[targetCountry].currencySymbol;
    r['numberOfBitcoinsBoughtAtOrigin'] = parseFloat(numberOfBitcoinsBoughtAtOrigin).toFixed(8);
    r['exchangeSource'] = sourceExchange;
    r['exchangeDestination'] = targetExchange;
    formatPromises[0] = format2(COUNTRIES[sourceCountry].currencySymbol, baseAmount);
    formatPromises[1] = format2(COUNTRIES[targetCountry].currencySymbol, amountAtSpotRate)
    formatPromises[2] = format2(COUNTRIES[targetCountry].currencySymbol, amountInDestinationCurrencyAfterSale)
    formatPromises[3] = format2(COUNTRIES[sourceCountry].currencySymbol, sourceBTCMarketPrice['currentHighestBidPrice'])
    formatPromises[4] = format2(COUNTRIES[sourceCountry].currencySymbol, sourceBTCMarketPrice['currentLowestOfferPrice'])
    formatPromises[5] = format2(COUNTRIES[targetCountry].currencySymbol, targetBTCMarketPrice['currentHighestBidPrice'])
    formatPromises[6] = format2(COUNTRIES[targetCountry].currencySymbol,  targetBTCMarketPrice['currentLowestOfferPrice'])

//    r['sign'] = "";
//    r['percentage'] = "";
//    r['rateAgeInMinutes'] = "";
//    r['rateRetrievedFrom'] = "";
//    r['amountInDestinationCurrencyUsingSpotRate'] = "";

    console.log('this is the rate: ' + JSON.stringify(exchangeRateObj, null, 2));
    amountAtSpotRate = baseAmount * exchangeRateObj.exchangeRate;
    formatPromises[7] = format2(COUNTRIES[targetCountry].currencySymbol, amountAtSpotRate);
    Promise.all(formatPromises).then(formatResults => {
      r['amountInSourceCurrency'] = formatResults[0];
      r['amountInDestinationCurrencyUsingSpotRate'] = formatResults[1];
      r['amountInDestinationCurrencyAfterBitcoinSale'] = formatResults[2];
      r['sourceHighestBidPrice'] = formatResults[3];;
      r['sourceLowestOfferPrice'] = formatResults[4];
      r['targetHighestBidPrice'] = formatResults[5];
      r['targetLowestOfferPrice'] = formatResults[6];
      r['amountInDestinationCurrencyUsingSpotRate'] = formatResults[7];

      console.log("amountInDestinationCurrencyAfterSale: " + amountInDestinationCurrencyAfterSale);
      console.log("amountAtSpotRate: " + amountAtSpotRate);
      if (amountInDestinationCurrencyAfterSale > amountAtSpotRate) {
        r['sign'] = '+';
        r['percentage'] = parseFloat((amountInDestinationCurrencyAfterSale - amountAtSpotRate) / amountAtSpotRate * 100).toFixed(2) + "%";
      } else {
        r['sign'] = '-';
        r['percentage'] = parseFloat((amountAtSpotRate - amountInDestinationCurrencyAfterSale) / amountInDestinationCurrencyAfterSale * 100).toFixed(2) + "%";
      }
      r['spotRate'] = parseFloat(exchangeRateObj.exchangeRate).toFixed(3);
      r['rateAgeInMinutes'] = exchangeRateObj.rateAgeInMinutes;
      r['rateRetrievedFrom'] = exchangeRateObj.retrievedFrom;
      res.status(200).send({data: r});
    })
    .catch(err => {
      console.log('This is the error: ' + err.message);
      res.status(500).send(err.message);
      return;
    });
    

  })
  .catch(err => {
    console.log('This is the error: ' + err.message);
    res.status(500).send(err.message);
    return;
  });
  
//     print('Google RESULT: {%s}-->{%s} = {%f}'% (source_currency, target_currency, amount_in_target_currency))
//     print('Bitcoin RESULT: {%f} ' % (amount_in_destination_currency_after_sale))
    
})
    
//     print json.dumps(r)

module.exports = router;