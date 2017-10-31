'use strict';

// declare axios for making http requests
const axios = require('axios');

const EXCHANGES = { "Foxbit": exchgFoxBit
                  , "BitcoinToYou": exchgBitcoinToYou
                  , "Mercado Bitcoin": exchgMercadoBitcoin
                  , "Independent Reserve": exchgIndependentReserve
                  , "SurBitcoin": exchgSurBitcoin
                  , "ChileBit.NET": exchgChileBit
                  , "Coins.ph": exchgCoinsPH
                  , "Coins.ph (THB)": exchgCoinsTHB
                  , "Coinbase": exchgCoinbaseUSD
                  , "luno": exchgLunoZAR
                  , "UrduBit": exchgUrduBitPKR
                  , "VBTC": exchgVBTC
                  }
//console.log("exchanges: " + EXCHANGES["Foxbit"]);

//setInterval(exchgIndependentReserve, 5000, callbackk);

function callbackk(err, data) {
  if (err) {
    // Send email
    console.log("ERROR: " + JSON.stringify(err, null, 2));
  }
}

function exchgIndependentReserve(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://api.independentreserve.com/Public/GetMarketSummary?primaryCurrencyCode=xbt&secondaryCurrencyCode=aud';
        axios.get(uri)
        .then(ir => {
              console.log(ir.data);
              resolve({'currentHighestBidPrice': ir.data.CurrentHighestBidPrice, 'currentLowestOfferPrice': ir.data.CurrentLowestOfferPrice});
            })
        .catch(error => {
            reject(new Error(error));
        });
    })    
}

function exchgSurBitcoin(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://api.blinktrade.com/api/v1/VEF/ticker?crypto_currency=BTC'
        axios.get(uri).then(res => {
            console.log('Response from SurBitcoin: ' + res.data);
            resolve({'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
          })
        .catch(error => {
            reject(new Error(error));
        });
    })
}

function exchgChileBit(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://api.blinktrade.com/api/v1/CLP/ticker?crypto_currency=BTC'
        axios.get(uri).then(res => {
            console.log('Response from ChileBit: ' + res.data);
            resolve({'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
          })
        .catch(error => {
            reject(new Error(error));
        });
    })
}

function exchgFoxBit(callback) {
    return new Promise(function (resolve, reject) {
        console.log("exchgFoxBit...");
        var uri = 'https://api.blinktrade.com/api/v1/BRL/ticker?crypto_currency=BTC'
        axios.get(uri).then(res => {
            console.log('Response from foxbit: ' + JSON.stringify(res.data));
            resolve({'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgVBTC(callback) {
    return new Promise(function (resolve, reject) {
        var headers = {"Content-type": "application/json","Accept": "text/plain"}
        var uri = 'https://api.blinktrade.com/api/v1/VND/ticker?crypto_currency=BTC'
        axios.get(uri).then(res => {
            console.log('Response from foxbit: ' + res.data);
            resolve({'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgUrduBitPKR(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://api.blinktrade.com/api/v1/PKR/ticker?crypto_currency=BTC'
        axios.get(uri).then(res => {
            console.log('Response from UrduBit: ' + res.data);
            resolve({'currentHighestBidPrice': res.data.buy, 'currentLowestOfferPrice': res.data.sell});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgBitcoinToYou(callback) {
    return new Promise(function (resolve, reject) {
        var headers = {"Content-type": "application/json","Accept": "text/plain"}
        var uri = 'https://www.bitcointoyou.com/api/ticker.aspx'
        axios.get(uri).then(res => {
            console.log('Response from BitcoinToYou: buy [' + res.data.ticker.buy + '] sell [' + res.data.ticker.sell + ']');
            resolve({'currentHighestBidPrice': res.data.ticker.buy, 'currentLowestOfferPrice': res.data.ticker.sell});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgMercadoBitcoin(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://www.mercadobitcoin.net/api/ticker/'
        axios.get(uri).then(res => {
            console.log('Response from Mercado Bitcoin: buy [' + res.data.ticker.buy + '] sell [' + res.data.ticker.sell + ']');
            resolve({'currentHighestBidPrice': res.data.ticker.buy, 'currentLowestOfferPrice': res.data.ticker.sell});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgCoinsPH(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://quote.coins.ph/v1/markets/BTC-PHP'
        axios.get(uri).then(res => {
            console.log('Response from CoinsPH: ' + JSON.stringify(res.data));
            resolve({'currentHighestBidPrice': res.data.market.bid, 'currentLowestOfferPrice': res.data.market.ask});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgCoinsTHB(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://quote.coins.ph/v1/markets/BTC-THB'
        axios.get(uri).then(res => {
            console.log('Response from CoinsPH: ' + res.data);
            resolve({'currentHighestBidPrice': res.data.market.bid, 'currentLowestOfferPrice': res.data.market.ask});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgBTCe(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://btc-e.com/api/3/ticker/btc_rur'
        axios.get(uri).then(res => {
            console.log('Response from BTC-e: ' + res.data);
            resolve({'currentHighestBidPrice': res.data.btc_rur.sell, 'currentLowestOfferPrice': res.data.btc_rur.buy});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgLunoZAR(callback) {
    return new Promise(function (resolve, reject) {
        var uri = 'https://api.mybitx.com/api/1/ticker?pair=XBTZAR';
        axios.get(uri).then(res => {
            console.log('Response from Luno: ' + res.data);
            resolve({'currentHighestBidPrice': res.data.bid, 'currentLowestOfferPrice': res.data.ask});
          })
        .catch(error => {
          reject(new Error(error));
        });
    })
}

function exchgCoinbaseUSD(callback) {
    return new Promise(function (resolve, reject) {
        var response = {'currentHighestBidPrice': 0, 'currentLowestOfferPrice': 0};
        var uriAsk = 'https://api.coinbase.com/v2/prices/BTC-USD/buy';
        var uriBid = 'https://api.coinbase.com/v2/prices/BTC-USD/sell';
        axios.get(uriBid).then(res => {
            console.log('Response from Coinbase: ' + res.data.data);
            response.currentHighestBidPrice = res.data.data.amount;
            axios.get(uriAsk).then(res => {
                    console.log('Response from Coinbase: ' + res.data.data);
                    response.currentLowestOfferPrice = res.data.data.amount;
                    resolve(response);
                  }).catch(error => {
                    reject(new Error(error));
                  });
          }).catch(error => {
            reject(new Error(error));
          });
    })
}

//console.log("exchanges: " + EXCHANGES["Foxbit"]);
module.exports = {EXCHANGES: EXCHANGES
  , exchgCoinbaseUSD: exchgCoinbaseUSD
  , exchgLunoZAR: exchgLunoZAR
  , exchgBTCe: exchgBTCe
  , exchgCoinsTHB: exchgCoinsTHB
  , exchgCoinsPH: exchgCoinsPH
  , exchgMercadoBitcoin: exchgMercadoBitcoin
  , exchgBitcoinToYou: exchgBitcoinToYou
  , exchgUrduBitPKR: exchgUrduBitPKR
  , exchgVBTC: exchgVBTC
  , exchgFoxBit: exchgFoxBit
  , exchgChileBit: exchgChileBit
  , exchgSurBitcoin: exchgSurBitcoin
  , exchgIndependentReserve: exchgIndependentReserve
};