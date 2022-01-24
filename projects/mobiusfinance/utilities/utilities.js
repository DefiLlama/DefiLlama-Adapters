const https = require('https');
const BigNumber = require('ethers').BigNumber;

function bigNumberify(n){
  return BigNumber.from(n);
}

exports.bigNumberify = bigNumberify;

exports.expandTo18Decimals = function(n) {
  return bigNumberify(n).mul(bigNumberify(10).pow(18))
}

exports.expandTo16Decimals = function(n) {
  return bigNumberify(n).mul(bigNumberify(10).pow(16))
}


exports.doRequest = function(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(responseBody);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

exports.doRequestPost = function(host,path,data) {
  return new Promise((resolve, reject) => {
    const req = https.request({host:host,path:path,method:'post'}, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(responseBody);
      });
    });
    req.write(data);
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}