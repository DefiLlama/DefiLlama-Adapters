const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const v1abi = require("./v1Abi.json");
const BigNumber = require("bignumber.js");
const { lendingMarket } = require("../helper/methodologies");

// cache some data
const markets = [
  {
    underlying: "0x0000000000000000000000000000000000001000",
    symbol: "FRA",
    decimals: 18,
    cToken: "0xBd4EEdA5062605f3C3b86039c5F2c5880F9ecD95"
  },
  {
    underlying: "0x2e8079E0fE49626AF8716fC38aDEa6799065D7f7",
    symbol: "USDC.e",
    decimals: 6,
    cToken: "0x02eCdC25F412C464A7495Cd91E04A4DbcB188936"
  },
  {
    underlying: "0x0632baa26299C9972eD4D9AfFa3FD057A72252Ff",
    symbol: "USDT.e",
    decimals: 6,
    cToken: "0xBf6cB8608DC0Df2fb02F0aF0F21829e7962b691D"
  },
  {
    underlying: "0x93EDFa31D7ac69999E964DAC9c25Cd6402c75DB3",
    symbol: "USDT.b",
    decimals: 18,
    cToken: "0xCC5E4a09F071c4DD24E4d48Fe170C3ba9415cC8F"
  },
  {
    underlying: "0xE80EB4a234f718eDc5B76Bb442653827D20Ebb2d",
    symbol: "BUSD.b",
    decimals: 18,
    cToken: "0x1486d107CdE1F9dA4f6F9e33e47Fa14d9dcA69af"
  }
];

// ask comptroller for all markets array
async function getAllCTokens(chainBlocks) {
  //block = 2797550
  return (await sdk.api.abi.call({
    block: chainBlocks["findora"],
    chain: "findora",
    target: "0x3b056De20d662B09f73bDb28Ea6fa7b7aC82259C",
    params: [],
    abi: abi["getAllMarkets"]
  })).output;
}

async function getUnderlying(block, cToken) {
  return (await sdk.api.abi.call({
    block,
    chain: "findora",
    target: cToken,
    abi: abi["underlying"]
  })).output;
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(chainBlocks) {
  if (chainBlocks["findora"] < 2797544) {
    // the allMarkets getter was only added in this block.
    return markets;
  } else {
    let allCTokens = await getAllCTokens(chainBlocks);
    // if not in cache, get from the blockchain
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
          markets.push({ underlying, cToken });
        }
      }))
    );

    return markets;
  }
}


async function v2Tvl(balances,chainBlocks, borrowed) {
  let markets = await getMarkets(chainBlocks);
  // Get V2 tokens locked
  let v2Locked = await sdk.api.abi.multiCall({
    block: chainBlocks["findora"],
    calls: markets.map((market) => ({
      target: market.cToken
    })),
    chain: "findora",
    abi: borrowed ? abi.totalBorrows : abi["getCash"]
  });

  let prices = await sdk.api.abi.multiCall({
    block: chainBlocks["findora"],
    calls: markets.map((market) => ({
      target: "0xdadBe4A286248b83A7dFECcDF67535bA4eC1A49c",
      params: market.cToken
    })),
    chain: "findora",
    abi: abi["getUnderlyingPrice"]
  });

  markets.forEach((market) => {
    let getCash = v2Locked.output.find((result) => result.input.target === market.cToken);
    let price = prices.output.find((result) => result.input.params[0] === market.cToken);
    //  console.log(getCash.output * price.output / 1e24);
    balances[market.underlying] = getCash.output * price.output / 1e24;
  });
  return balances;
}

async function borrowed(timestamp, block, chainBlocks) {
  let balances = {};
  await v2Tvl(chainBlocks, true);
  return balances;
}

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  await v2Tvl(chainBlocks, false);
  return balances;
}

module.exports = {
  timetravel: true,
  start: 2797544,
  findora: {
    tvl,
    borrowed
  },
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`
};
