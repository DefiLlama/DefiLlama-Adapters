const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { getBlock } = require('../helper/getBlock')

const comptroller = "0xb74633f2022452f377403B638167b0A135DB096d"

// ask comptroller for all markets array
async function getAllCTokens(block) {
  return (await sdk.api.abi.call({
    block,
    chain: 'heco',
    target: comptroller,
    params: [],
    abi: abi['getAllMarkets'],
  })).output;
}

async function getUnderlying(block, cToken) {
  if (cToken === '0x824151251B38056d54A15E56B73c54ba44811aF8') {
    return '0x6f259637dcd74c767781e37bc6133cd6a68aa161';//cHT => HT
  } else {
    const token = (await sdk.api.abi.call({
      block,
      chain: 'heco',
      target: cToken,
      abi: abi['underlying'],
    })).output;
    if (token === '0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a') {
      return '0x6b175474e89094c44da98b954eedeac495271d0f';//DAI => DAI
    } else if (token === '0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B') {
      return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';//USDC => USDC
    } else {
      return 'heco:' + token
    }
  }
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(block) {
  let allCTokens = await getAllCTokens(block);
  const markets = []
  await (
    Promise.all(allCTokens.map(async (cToken) => {
      let foundMarket = false;
      for (let market of markets) {
        if (market.cToken.toLowerCase() === cToken.toLowerCase()) {
          foundMarket = true;
        }
      }
      if (!foundMarket) {
        let underlying = await getUnderlying(block, cToken);
        markets.push({ underlying, cToken })
      }
    }))
  );

  return markets;
}

const replacements = {
  "heco:0xc2CB6B5357CcCE1B99Cd22232942D9A225Ea4eb1": {
    coingecko: "bitcoin-cash-sv",
    decimals: 1e18
  },
  //"heco:0x581EdD7eAb23896513360D7EE8DfE07A5Cad2aBd": "tether",
  "heco:0x6514a5Ebff7944099591Ae3e8A5c0979C83B2571": {
    coingecko: "neo",
    decimals: 1e8
  },
  "heco:0x45e97daD828AD735af1dF0473fc2735F0Fd5330c": {
    coingecko: "tezos",
    decimals: 1e18,
  }
}
async function tvl(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const block = undefined //await getBlock(timestamp, 'heco', chainBlocks)
  let markets = await getMarkets(block);

  // Get V2 tokens locked
  let v2Locked = await sdk.api.abi.multiCall({
    block,
    calls: _.map(markets, (market) => ({
      target: market.cToken,
    })),
    chain: 'heco',
    abi: abi['getCash'],
  });

  _.each(markets, (market) => {
    let getCash = _.find(v2Locked.output, (result) => result.input.target === market.cToken);

    if (getCash) {
      if(getCash.output === null){
        throw new Error("getCash failed")
      }
      const replacement = replacements[market.underlying]
      if(replacement === undefined){
        sdk.util.sumSingleBalance(balances, market.underlying, getCash.output)
      } else {
        sdk.util.sumSingleBalance(balances, replacement.coingecko, Number(getCash.output)/replacement.decimals)
      }
    }
  });

  return balances;
}

module.exports = {
  tvl,
};
