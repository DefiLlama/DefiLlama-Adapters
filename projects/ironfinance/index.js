const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const abip = require("./abip.json");

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const info = (
    await sdk.api.abi.call({
      target: "0xFE6F0534079507De1Ed5632E3a2D4aFC2423ead2",
      abi: abi.info,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const collateralToken = (
    await sdk.api.abi.call({
      target: "0xFE6F0534079507De1Ed5632E3a2D4aFC2423ead2",
      abi: abi.getCollateralToken,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `bsc:${collateralToken}`, info[1]);

  return balances;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const info = (
    await sdk.api.abi.call({
      target: "0xD078B62f8D9f5F69a6e6343e3e1eC9059770B830",
      abi: abip.info,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output;

  const collateral = (
    await sdk.api.abi.call({
      target: "0xD078B62f8D9f5F69a6e6343e3e1eC9059770B830",
      abi: abip.collateral,
      chain: "polygon",
      block: chainBlocks["polygon"],
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `polygon:${collateral}`, info[0]);

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl]),
};
