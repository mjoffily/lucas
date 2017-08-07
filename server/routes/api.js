'use strict';

const express = require('express');
// declare axios for making http requests
const axios = require('axios');
var Promise = require('bluebird');
var google = require('../../node_modules/googleapis/lib/googleapis.js');

const router = express.Router();

const COUNTRIES = {'Australia': {'country': 'Australia', 'currencySymbol': 'AUD', 'name': 'Australian Dolar', 'exchanges':[
                     {name: 'Independente Reserve', method: exchgIndependentReserve}]},
                   'Brazil': {'country':'Brazil', 'currencySymbol':'BRL', 'name': 'Brazilian Real', 'exchanges':[
                     {name: 'Foxbit', method: exchgFoxBit}, 
                     {name: 'BitcoinToYou', method: exchgBitcoinToYou}, 
                     {name: 'Mercado Bitcoin', method: exchgMercadoBitcoin}, 
                     {name: 'CoinBR', method: exchgIndependentReserve}]},
                   'Chile': {'country':'Chile', 'currencySymbol':'CLP', 'name': 'Chilean Peso', 'exchanges':[{'name': 'ChileBit.NET'}]},
                   'Pakistan': {'country':'Pakistan', 'currencySymbol':'PKR', 'name': 'Pakistani Rupee', 'exchanges':[{'name': 'UrduBit'}]},
                   'Philippines': {'country':'Philippines', 'currencySymbol': 'PHP', 'name': 'Philipino Peso', 'exchanges':[{'name': 'Coins.ph', method: exchgCoinsPH}]},
                   'Russia': {'country':'Russia', 'currencySymbol':'RUB', 'name': 'Russian Ruble', 'exchanges':[{'name': 'BTC-e', method: exchgBTCe}]},
                   'South Africa': {'country':'South Africa', 'currencySymbol':'ZAR', 'name': 'South African Rand', 'exchanges':[{'name': 'luno', method: exchgLunoZAR}]},
                   'Thailand': {'country':'Thailand', 'currencySymbol':'THB', 'name': 'Thailand Baht', 'exchanges':[{'name': 'Coins.ph (THB)', method: exchgCoinsTHB}]},
                   'United States': {'country':'United States', 'currencySymbol':'USD', 'name': 'American dolar', 'exchanges':[{'name': 'Coinbase', method: exchgCoinbaseUSD}]},
                   'Venezuela': {'country':'Venezuela', 'currencySymbol':'VEF', 'name': 'Venezuelan Bolivar', 'exchanges':[{'name': 'SurBitcoin'}]},
                   'Vietnam': {'country':'Vietnam', 'currencySymbol':'VND', 'name': 'Vietnamise Dongs', 'exchanges':[{'name': 'VBTC'}]}
                };

const EXCHANGES = { "Foxbit": exchgFoxBit
                  , "BitcoinToYou": exchgBitcoinToYou
                  , "Mercado Bitcoin": exchgMercadoBitcoin
                  , "Independente Reserve": exchgIndependentReserve
                  , "SurBitcoin": exchgSurBitcoin
                  , "ChileBit.NET": exchgChileBit
                  , "Coins.ph": exchgCoinsPH
                  , "Coins.ph (THB)": exchgCoinsTHB
                  , "Coinbase": exchgCoinbaseUSD
                  , "luno": exchgLunoZAR
                  , "UrduBit": exchgUrduBitPKR
                  , "VBTC": exchgVBTC
                  }
                        
//const API = 'https://jsonplaceholder.typicode.com';
const API = 'https://angular2test-mjoffily.c9users.io:8080';
/* GET api listing. */


function findExchange(arr, name) {
  for (var i in arr) {
     if (i['name'] === name) {
       return i['method'];
     } 
  }
  return null;
}
//var fs = Promise.promisifyAll(require('fs'));

function isSupportedCountry(country, callback) {

  if (COUNTRIES[country]) {
    callback(null, true);
  } else {
    callback(null, false);
  }   
}

function getExchangeRate(sourceCountry, targetCountry, callback) {
  
  isSupportedCountry(sourceCountry, (err, supported) => {
    if (!supported) {
      console.log('Error: country not supported ' + sourceCountry);
      callback(new Error('source country not supported '), null);
      return;
    } else {
      isSupportedCountry(targetCountry, (err, supported) => {
        if (!supported) {
          callback(new Error('target country not supported '), null);
          return;
        } else {
          var customsearch = google.customsearch('v1');
          var queryString = '1+' + COUNTRIES[sourceCountry].currencySymbol + '+to+' + COUNTRIES[targetCountry].currencySymbol
          var currencyPair = COUNTRIES[sourceCountry].currencySymbol + COUNTRIES[targetCountry].currencySymbol
          
          // You can get a custom search engine id at
          // https://www.google.com/cse/create/new
          const CX = '004065446796459763735:mlqrh0wzros';
          const API_KEY = 'AIzaSyBoq2eKA4tUmVXztAkT0m1Uu6YR5BC22yE';
          const SEARCH = queryString;
          
          customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY }, function (err, resp) {
            if (err) {
              callback(new Error(err), null);
              return;
            } else {
              console.log(resp.items.length)
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
                  console.log('rate: ' + rate);
                  callback(null, rate);
                  return;
                }
              }
            }
            callback(new Error("could not find exchange rate for " + currencyPair), null);
          });
        }
      });    
    }
  });
}

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

function exchgIndependentReserve(callback) {
  var uri = 'https://api.independentreserve.com/Public/GetMarketSummary?primaryCurrencyCode=xbt&secondaryCurrencyCode=aud';
  axios.get(uri).then(ir => {
          console.log(ir.data);
          callback(null, {'currentHighestBidPrice': ir.data.CurrentHighestBidPrice, 'currentLowestOfferPrice': ir.data.CurrentLowestOfferPrice});
        })
    .catch(error => {
        callback(new Error(error), null);
    });
}

function exchgSurBitcoin(callback) {
  var uri = 'https://api.blinktrade.com/api/v1/VEF/ticker?crypto_currency=BTC'
   axios.get(uri).then(res => {
        console.log('Response from SurBitcoin: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
      })
    .catch(error => {
        callback(new Error(error), null);
    });
}

function exchgChileBit(callback) {
  var uri = 'https://api.blinktrade.com/api/v1/CLP/ticker?crypto_currency=BTC'
   axios.get(uri).then(res => {
        console.log('Response from ChileBit: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
      })
    .catch(error => {
        callback(new Error(error), null);
    });
}

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


function exchgFoxBit(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://api.blinktrade.com/api/v1/BRL/ticker?crypto_currency=BTC'
   axios.get(uri).then(res => {
        console.log('Response from foxbit: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

function exchgVBTC(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://api.blinktrade.com/api/v1/VND/ticker?crypto_currency=BTC'
   axios.get(uri).then(res => {
        console.log('Response from foxbit: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

function exchgUrduBitPKR(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://api.blinktrade.com/api/v1/PKR/ticker?crypto_currency=BTC'
   axios.get(uri).then(res => {
        console.log('Response from UrduBit: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

function exchgBitcoinToYou(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://www.bitcointoyou.com/api/ticker.aspx'
   axios.get(uri).then(res => {
        console.log('Response from BitcoinToYou: buy [' + res.data.ticker.buy + '] sell [' + res.data.ticker.sell + ']');
        callback(null, {'currentHighestBidPrice': res.data.ticker.buy, 'currentLowestOfferPrice': res.data.ticker.sell});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

function exchgMercadoBitcoin(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://www.mercadobitcoin.net/api/ticker/'
   axios.get(uri).then(res => {
        console.log('Response from Mercado Bitcoin: buy [' + res.data.ticker.buy + '] sell [' + res.data.ticker.sell + ']');
        callback(null, {'currentHighestBidPrice': res.data.ticker.buy, 'currentLowestOfferPrice': res.data.ticker.sell});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

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

function exchgCoinsPH(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://quote.coins.ph/v1/markets/BTC-PHP'
   axios.get(uri).then(res => {
        console.log('Response from CoinsPH: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.market.bid, 'currentLowestOfferPrice': res.data.market.ask});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

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
  
function exchgCoinsTHB(callback) {
 var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://quote.coins.ph/v1/markets/BTC-THB'
   axios.get(uri).then(res => {
        console.log('Response from CoinsPH: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.market.bid, 'currentLowestOfferPrice': res.data.market.ask});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

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

function exchgBTCe(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://btc-e.com/api/3/ticker/btc_rur'
   axios.get(uri).then(res => {
        console.log('Response from BTC-e: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.btc_rur.sell, 'currentLowestOfferPrice': res.data.btc_rur.buy});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

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

function exchgLunoZAR(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"}
  var uri = 'https://api.mybitx.com/api/1/ticker?pair=XBTZAR';
   axios.get(uri).then(res => {
        console.log('Response from Luno: ' + res.data);
        callback(null, {'currentHighestBidPrice': res.data.bid, 'currentLowestOfferPrice': res.data.ask});
      })
  .catch(error => {
      callback(new Error(error), null);
  });
}

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
function exchgCoinbaseUSD(callback) {
  var headers = {"Content-type": "application/json","Accept": "text/plain"};
  var response = {'currentHighestBidPrice': 0, 'currentLowestOfferPrice': 0};
  var uriAsk = 'https://api.coinbase.com/v2/prices/BTC-USD/buy';
  var uriBid = 'https://api.coinbase.com/v2/prices/BTC-USD/sell';
   axios.get(uriBid).then(res => {
        console.log('Response from Coinbase: ' + res.data.data);
        response.currentHighestBidPrice = res.data.data.amount;
        axios.get(uriAsk).then(res => {
                console.log('Response from Coinbase: ' + res.data.data);
                response.currentLowestOfferPrice = res.data.data.amount;
                callback(null, response);
              }).catch(error => {
                callback(new Error(error), null);
              });
      }).catch(error => {
        callback(new Error(error), null);
      });
}

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

router.get('/arbitrage', (req, res) => {
  console.log(req.query);
  if (! req.query.sourceCountry) {
    res.status(400).send({data: [], error: {code: 400, message: 'source currency must be informed '}});
    return;
  }
  
  if (! req.query.targetCountry) {
    res.status(400).send({data: [], error: {code: 400, message: 'target currency must be informed '}});
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
  

  var sourceBTCMarketPrice = 0.0;
  var targetBTCMarketPrice = 0.0;
  var numberOfBitcoinsBoughtAtOrigin = 0;
  var amountInDestinationCurrencyAfterSale = 0.0;
  
  EXCHANGES[sourceExchange]((err, data) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    } else {
      sourceBTCMarketPrice = data;
      numberOfBitcoinsBoughtAtOrigin = baseAmount / sourceBTCMarketPrice['currentLowestOfferPrice'];
      console.log('Number of bitcoins bought at source ' +  numberOfBitcoinsBoughtAtOrigin);
      var exchange = findExchange()
      EXCHANGES[targetExchange]((err, data) => {
        if (err) {
          res.status(500).send('Error retrieving bitcoin price at target exchange ' + err.message);
          return;
        } else {
          targetBTCMarketPrice = data;
          amountInDestinationCurrencyAfterSale = numberOfBitcoinsBoughtAtOrigin * targetBTCMarketPrice['currentHighestBidPrice']
          console.log('Amount after bitcoin sale in target country ' +  amountInDestinationCurrencyAfterSale);

          var r = {}
          r['spotRate'] = parseFloat(exchangeRate).toFixed(3) + "%";
          r['currencyPair'] = COUNTRIES[sourceCountry].currencySymbol + "/" + COUNTRIES[targetCountry].currencySymbol;
          r['amountInSourceCurrency'] = COUNTRIES[sourceCountry].currencySymbol + " " + parseFloat(baseAmount).toFixed(2);
          r['amountInDestinationCurrencyUsingSpotRate'] = COUNTRIES[targetCountry].currencySymbol + " " + parseFloat(amountAtSpotRate).toFixed(2);
          r['numberOfBitcoinsBoughtAtOrigin'] = parseFloat(numberOfBitcoinsBoughtAtOrigin).toFixed(8);
          r['amountInDestinationCurrencyAfterBitcoinSale'] = COUNTRIES[targetCountry].currencySymbol + " " + parseFloat(amountInDestinationCurrencyAfterSale).toFixed(2);
          r['exchangeSource'] = sourceExchange;
          r['exchangeDestination'] = targetExchange;

          if (sourceCountry !== targetCountry) {
            
            getExchangeRate(sourceCountry, targetCountry, (err, data) => {
              if (err) {
                console.log('This is the error: ' + err.message);
                res.status(400).send({data: [], error: {code: 400, message: err.message}});
              } else {
                console.log('this is the rate: ' + data);
                exchangeRate = data;
                amountAtSpotRate = baseAmount * exchangeRate;
                if (amountInDestinationCurrencyAfterSale > amountAtSpotRate) {
                  r['sign'] = '+';
                  r['percentage'] = parseFloat((amountInDestinationCurrencyAfterSale - amountAtSpotRate) / amountAtSpotRate * 100).toFixed(2) + "%";
                } else {
                  r['sign'] = '-';
                  r['percentage'] = parseFloat((amountAtSpotRate - amountInDestinationCurrencyAfterSale) / amountInDestinationCurrencyAfterSale * 100).toFixed(2) + "%";
                }
                r['spotRate'] = parseFloat(exchangeRate).toFixed(3);
                r['amountInDestinationCurrencyUsingSpotRate'] = COUNTRIES[targetCountry].currencySymbol + " " + parseFloat(amountAtSpotRate).toFixed(2);
                res.status(200).send({data: r});
              }
            
            });
          } else {
            res.status(200).json(r);
          }
        }
      });
    }
  });
  
  
    
    
//     print('Google RESULT: {%s}-->{%s} = {%f}'% (source_currency, target_currency, amount_in_target_currency))
//     print('Bitcoin RESULT: {%f} ' % (amount_in_destination_currency_after_sale))
    
})
    
//     print json.dumps(r)

module.exports = router;