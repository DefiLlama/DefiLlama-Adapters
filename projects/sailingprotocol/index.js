const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const axios = require('axios');

const tokens = [
  {
    "address": "0x75B5DACEc8DACcb260eA47549aE882513A21CE01",
    "ticker": "SPY",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x2E4763AdBEe00D5eB3089ec25973599c0e62dD07",
    "ticker": "ARKK",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0xf69eadAd0A7cE0aD62ac7AdB16338f55Fa5aEdbD",
    "ticker": "DLO",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0xD07dd056c2C2073565C992B4aC2321b6A2e4a112",
    "ticker": "SUPV",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x57c1e6001519D2C7FcEE64a8e03e1bDba7A1716F",
    "ticker": "AAPL",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0xfb7a9dea566381c912aC3a221595F6559bFCDEc6",
    "ticker": "TSLA",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x81B841D336D984233353420d172309f321EfBc02",
    "ticker": "META",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0xC777b949c0889094BC9A241BCFE8e9492b18824f",
    "ticker": "AMZN",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0xD9aEA8D7712aA5F54EDA0982211f38ecDDa22BA1",
    "ticker": "GME",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0xA265653185Ed26a27e93092c458b5C6a6aEF078a",
    "ticker": "AMC",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x7f6b23782DC290C6758E6014e6F512E1b46f07e6",
    "ticker": "DIS",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x7d0e7d4617B7B1a4D335e7E6Fef2f0F98Fb8D6D9",
    "ticker": "MSTR",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x019293eDC7A277F8879EC51A59E0Ffe415f6120e",
    "ticker": "QQQ",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0xBa5c32915e2303EA41d1986f5B3AAd0a98B4Fd80",
    "ticker": "ETHE",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0xA78Fb2b64Ce2Fb8bBe46968cf961C5Be6eB12924",
    "ticker": "AAAU",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x79E2174f64286Bb92c8BD00d0D8A126eAc664c27",
    "ticker": "ABNB",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
  {
    "address": "0x1e01aE049Bcb76ec91aa59e11b84a01375cB19b0",
    "ticker": "DNA",
    "sufficientLiquidityForDefiLlamaIndexer": false,
  },
];

async function tvl(api) {
  const addTokenTVL = async (token) => {
    const tokenTotalSupply = await api.call({ target: token.address, abi: 'erc20:totalSupply' });
    if (token.sufficientLiquidityForDefiLlamaIndexer) {
      api.add(token.address, tokenTotalSupply);
    } else {
      const tickerPricing = await axios.post(
        'https://sailingprotocol.org/api/sailingprotocol/market_data/historical_intraday',
        {
          ticker: token.ticker
        }
      );
      const tickerPrice = Object.values(tickerPricing.data).pop(); // latest price
      api.add(
        ADDRESSES.kava.USDt, // usdtKavaAddress
        tokenTotalSupply * tickerPrice * (1e6 / 1e18)
      );
    }
  };
  const promises = [];
  for (const token of tokens) {
    promises.push(addTokenTVL(token));
  }
  await Promise.all(promises);
}

module.exports = {
  misrepresentedTokens: true, // false, // until all tokens are indexed by defillama
  timetravel: false, // true, // until there is enough dex liquidity for the main tokens
  kava: { tvl, },
  methodology: 'The total supply of their circulating stocks is extracted from their stock token contracts.'
}
