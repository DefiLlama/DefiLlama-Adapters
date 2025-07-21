const sdk = require('@defillama/sdk');
const { sumTokens } = require('../helper/chain/bitcoin.js');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

async function tvl(api) {
  const response = await fetch("https://www.coinbase.com/cbbtc/proof-of-reserves.json", {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.5",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Brave\";v=\"138\"",
      "sec-ch-ua-arch": "\"x86\"",
      "sec-ch-ua-bitness": "\"64\"",
      "sec-ch-ua-full-version-list": "\"Not)A;Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"138.0.0.0\", \"Brave\";v=\"138.0.0.0\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": "\"\"",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-ch-ua-platform-version": "\"6.2.0\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "upgrade-insecure-requests": "1",
    },
    "body": null,
    "method": "GET"
  });

  const res = await response.json();

  const bitcoinWallets = res.reserveAddresses.map(item => item.address)

  return sumTokens({ timestamp: api.timestamp, owners: bitcoinWallets })
}

module.exports = {
  methodology: "BTC collateral backing CBBTC. https://www.coinbase.com/cbbtc/proof-of-reserves",
  bitcoin: {
    tvl,
  },
};
