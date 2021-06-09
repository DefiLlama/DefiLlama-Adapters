const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");

const erc20 = require("../helper/abis/erc20.json");

// --- Grab from here the pools available atm ---
const DOOPLE_API = "https://dopple-api.kowito.com/";

// --- Stable only swaps ---
const assetsOnExchange = [
  // -> BUSD
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  // -> BUSD-T
  "0x55d398326f99059fF775485246999027B3197955",
  // -> USDC
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  // -> DAI
  "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  // -> UST
  "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",
  // -> BTCB
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  // -> DOLLY
  "0xfF54da7CAF3BC3D34664891fC8f3c9B6DeA6c7A5"
];

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  let balances = {};

  let poolsInfo = (await utils.fetchURL(DOOPLE_API)).data.pool;

  const poolAddresses = Object.keys(poolsInfo);

  for (let i = 0; i < poolAddresses.length; i++) {
    for (let j = 0; j < assetsOnExchange.length; j++) {
      const balance = (
        await sdk.api.abi.call({
          block: chainBlocks["bsc"],
          chain: "bsc",
          target: assetsOnExchange[j],
          params: poolAddresses[i],
          abi: erc20["balanceOf"],
        })
      ).output;

      sdk.util.sumSingleBalance(balances, `bsc:${assetsOnExchange[j]}`, balance);
    }
  }

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
