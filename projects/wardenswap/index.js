const sdk = require("@defillama/sdk");
const token0 = require("../helper/abis/token0.json");
const token1 = require("../helper/abis/token1.json");
const getReserves = require("../helper/abis/getReserves.json");

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const trackedPairAddresses = [
    "0xdc683adb914edf91df4a36c33ee4f59ca41bc263", // WAD/BNB
    "0xc95b1750043fce5dfcc8539835ea3830ec002a89", // WAD/BUSD
    "0xcf643c4b9dbf42239aa00e23a0570c90d517e6dc", // BUSD/BNB
    "0xfd468f81f4a6d859a0eb3667c65f7bea9dc69028", // USDT/BNB
    "0x1b1675a97b2f62b568569ebd349e88a04dde8586", // BTCB/BNB
    "0x8485c5f255ff30aafab0030329e508bd8dde11c5", // ETH/BNB
    "0x087d69b97a6df4fb37e4e93a31752008223a6c19", // USDT/BUSD
  ];

  const chain = "bsc";
  const multiCallProperties = {
    chain,
    calls: trackedPairAddresses.map((pairAddress) => ({
      target: pairAddress,
    })),
    block: chainBlocks[chain],
  };

  const [token0Addresses, token1Addresses, reserves] = await Promise.all([
    sdk.api.abi
      .multiCall({
        abi: token0,
        ...multiCallProperties,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: token1,
        ...multiCallProperties,
      })
      .then(({ output }) => output),
    sdk.api.abi
      .multiCall({
        abi: getReserves,
        ...multiCallProperties,
      })
      .then(({ output }) => output),
  ]);

  trackedPairAddresses.forEach((_addr, n) => {
    sdk.util.sumSingleBalance(
      balances,
      `${chain}:${token1Addresses[n].output}`,
      reserves[n].output[1]
    );
    sdk.util.sumSingleBalance(
      balances,
      `${chain}:${token0Addresses[n].output}`,
      reserves[n].output[0]
    );
  });

  return balances;
};

module.exports = {
  name: 'WardenSwap',
  website: 'https://www.wardenswap.finance/',
  token: 'WAD',
  category: 'dexes',
  methodology: "TVL of WardenSwap is calculated by querying total liquidity of WardenSwap's active pools listed on our farm page https://farm.wardenswap.finance/?t=1&s=1/#/farm. However, pools at PancakeSwap and inactive pools are not included",
  bsc:{
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
