const _ = require('underscore');
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { getBlock } = require('../helper/getBlock')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const { compoundExportsWithDifferentBase, compoundExports } = require('../helper/compound');

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
    return token
  }
}

function transformAddress(token){
  if(token === '0x6f259637dcd74c767781e37bc6133cd6a68aa161'){
    return token
  } else if (token === '0x3D760a45D0887DFD89A2F5385a236B29Cb46ED2a') {
    return '0x6b175474e89094c44da98b954eedeac495271d0f';//DAI => DAI
  } else if (token === '0x9362Bbef4B8313A8Aa9f0c9808B80577Aa26B73B') {
    return '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';//USDC => USDC
  } else if (token === "0x5eE41aB6edd38cDfB9f6B4e6Cf7F75c87E170d98"){
    return "0x0000000000085d4780b73119b644ae5ecd22b376" //TUSD
  } else {
    return 'heco:' + token
  }
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(block) {
  let allCTokens = await getAllCTokens(block);
  const markets = []
  await (
    Promise.all(allCTokens.map(async (cToken) => {
      let underlying = await getUnderlying(block, cToken);
      markets.push({ underlying, cToken })
    }))
  );

  return markets;
}

const replacements = {
  "0xc2CB6B5357CcCE1B99Cd22232942D9A225Ea4eb1": {
    coingecko: "bitcoin-cash-sv",
    decimals: 1e18
  },
  //"heco:0x581EdD7eAb23896513360D7EE8DfE07A5Cad2aBd": "tether",
  "0x6514a5Ebff7944099591Ae3e8A5c0979C83B2571": {
    coingecko: "neo",
    decimals: 1e8
  },
  "0x45e97daD828AD735af1dF0473fc2735F0Fd5330c": {
    coingecko: "tezos",
    decimals: 1e18,
  }
}
function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    let balances = {};
    const block = await getBlock(timestamp, 'heco', chainBlocks, true)
    let markets = await getMarkets(block);

    let v2Locked = await sdk.api.abi.multiCall({
      block,
      calls: _.map(markets, (market) => ({
        target: market.cToken,
      })),
      chain: 'heco',
      abi: borrowed ? abi.totalBorrows : abi['getCash'],
    });

    const symbols = await sdk.api.abi.multiCall({
      block,
      calls: _.map(markets, (market) => ({
        target: market.cToken,
      })),
      chain: 'heco',
      abi: "erc20:symbol",
    });

    const lps = []
    _.each(markets, (market, idx) => {
      let getCash = _.find(v2Locked.output, (result) => result.input.target === market.cToken);
      const symbol = _.find(symbols.output, (result) => result.input.target === market.cToken);
      if (getCash.output === null) {
        throw new Error("getCash failed")
      }
      if (symbol.output.endsWith("LP")) {
        lps.push({
          token: market.underlying,
          balance: getCash.output
        })
      } else {
        const replacement = replacements[market.underlying]
        if (replacement === undefined) {
          sdk.util.sumSingleBalance(balances, transformAddress(market.underlying), getCash.output)
        } else {
          sdk.util.sumSingleBalance(balances, replacement.coingecko, Number(getCash.output) / replacement.decimals)
        }
      }
    });
    
    await unwrapUniswapLPs(balances, lps, block, "heco", transformAddress)
    return balances;
  }
}

// DANGER!! Oracles are not priced against USD but against other base tokens, such as IOTX
module.exports = {
  timetravel: true, // Impossible because getBlock will rug tho
  heco: {
    tvl: lending(false),
    borrowed: lending(true)
  },
  iotex: compoundExportsWithDifferentBase("0x55E5F6E48FD4715e1c05b9dAfa5CfD0B387425Ee", "iotex", "iotex"),
  bsc: compoundExports("0xF0700A310Cb14615a67EEc1A8dAd5791859f65f1", "bsc"),
  polygon: compoundExports("0xfBE0f3A3d1405257Bd69691406Eafa73f5095723", "polygon"),
  arbitrum: compoundExports("0xF67EF5E77B350A81DcbA5430Bc8bE876eDa8D591", "arbitrum"),
  elastos: compoundExportsWithDifferentBase("0xE52792E024697A6be770e5d6F1C455550265B2CD", "elastos", "elastos"),
};
