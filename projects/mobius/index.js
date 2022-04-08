/*==================================================
  Modules
  ==================================================*/
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const _ = require("underscore");
const { getBlock } = require("../helper/getBlock"); //added module

/*==================================================
  Addresses
  ==================================================*/
const wBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const wETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const cUSD = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const wBTCO = "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE";
const pUSDC = "0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941";
const cUSDC = "0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7";

const decimals = {
  [wBTC]: 8,
  [wBTCO]: 8,
  [cUSDC]: 6,
  [pUSDC]: 6,
  ["celo-dollar"]: 0,
};

// {[string: name]: {
//   address: string,
//   peggedTo: string
//   tokens: string[],
// }}
const pools = {
  usdc_eth_optics: {
    address: "0xA5037661989789d0310aC2B796fa78F1B01F195D",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7",
    ],
  },
  usdc_poly_optics: {
    address: "0x2080AAa167e2225e1FC9923250bA60E19a180Fb2",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941",
    ],
  },
  wbtc: {
    address: "0x19260b9b573569dDB105780176547875fE9fedA3",
    peggedTo: wBTC,
    tokens: [
      "0xD629eb00dEced2a080B7EC630eF6aC117e614f1b",
      "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE",
    ],
  },
  weth: {
    address: "0xE0F2cc70E52f05eDb383313393d88Df2937DA55a",
    peggedTo: wETH,
    tokens: [
      "0x2DEf4285787d58a2f811AF24755A8150622f4361",
      "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4",
    ],
  },
  usdt_moss: {
    address: "0xdBF27fD2a702Cc02ac7aCF0aea376db780D53247",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D",
    ],
  },
  usdc_moss: {
    address: "0x0ff04189Ef135b6541E56f7C638489De92E9c778",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0x93DB49bE12B864019dA9Cb147ba75cDC0506190e",
    ],
  },
};
/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, ethBlock, chainBlocks) {
  const chain = "celo";
  const block = await getBlock(timestamp ?? Date.now(), chain, chainBlocks);
  const balances = {};

  const promises = Object.values(pools).map(async (pool) => {
    const { address, peggedTo, tokens } = pool;
    const peg = peggedTo === cUSD ? "celo-dollar" : peggedTo;
    if (!balances[peg]) {
      balances[peg] = BigNumber(0);
    }
    const tokenBalances = await Promise.all(
      tokens.map(async (token) => {
        const balance = await sdk.api.erc20.balanceOf({
          block,
          chain,
          target: token,
          owner: address,
        });
        const baseDecimals = decimals[token] ?? 18;
        const targetDecimals = decimals[peg] ?? 18;
        if (baseDecimals === targetDecimals) return BigNumber(balance.output);
        if (baseDecimals < targetDecimals)
          return BigNumber(balance.output).multipliedBy(
            BigNumber(10).exponentiatedBy(
              BigNumber(targetDecimals - baseDecimals)
            )
          );
        return BigNumber(balance.output).dividedBy(
          BigNumber(10).exponentiatedBy(
            BigNumber(baseDecimals - targetDecimals)
          )
        );
      })
    );
    balances[peg] = tokenBalances.reduce(
      (accum, cur) => accum.plus(cur),
      balances[peg]
    );
  });

  await Promise.all(promises);

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: "Mobius", // project name
  website: "https://mobius.money",
  category: "DEXes", // allowed values as shown on DefiPulse:
  start: 8606077, // January 19, 2021 11:51:30 AM
  tvl, // tvl adapter
};

///
