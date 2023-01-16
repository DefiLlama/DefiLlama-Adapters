const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const abi = require("./abis");
const address = require("./address");

async function getTVL(balances, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];

  const { output: simpleReservesData } = await sdk.api.abi.call({
    target: address.UiPoolDataProvider[chain],
    params: [address.LendPoolAddressProvider[chain]],
    abi: abi.UiPoolDataProvider.find((a) => a.name === "getSimpleReservesData"),
    block,
    chain,
  });
  simpleReservesData.forEach((d) => {
    balances[d.underlyingAsset] = new BigNumber(
      balances[d.underlyingAsset] || 0
    ).plus(d.availableLiquidity);
  });

  return balances;
}

async function getNFTTVL(balances, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];

  const { output: simpleNftsData } = await sdk.api.abi.call({
    target: address.UiPoolDataProvider[chain],
    params: [address.LendPoolAddressProvider[chain]],
    abi: abi.UiPoolDataProvider.find((a) => a.name === "getSimpleNftsData"),
    block,
    chain,
  });

  simpleNftsData.forEach((d) => {
    balances[d.underlyingAsset] = new BigNumber(
      balances[d.underlyingAsset] || 0
    ).plus(new BigNumber(d.totalCollateral));
  });

  return balances;
}

async function getBorrowed(balances, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];

  const { output: simpleReservesData } = await sdk.api.abi.call({
    target: address.UiPoolDataProvider[chain],
    params: [address.LendPoolAddressProvider[chain]],
    abi: abi.UiPoolDataProvider.find((a) => a.name === "getSimpleReservesData"),
    block,
    chain,
  });

  simpleReservesData.forEach((d) => {
    balances[d.underlyingAsset] = new BigNumber(
      balances[d.underlyingAsset] || 0
    ).plus(d.totalVariableDebt);
  });

  return balances;
}

async function getAPY(apys, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];

  const { output: simpleReservesData } = await sdk.api.abi.call({
    target: address.UiPoolDataProvider[chain],
    params: [address.LendPoolAddressProvider[chain]],
    abi: abi.UiPoolDataProvider.find((a) => a.name === "getSimpleReservesData"),
    block,
    chain,
  });

  simpleReservesData.forEach((d) => {
    apys[d.underlyingAsset] = new BigNumber(d.liquidityRate);
  });

  return apys;
}

module.exports = {
  getTVL,
  getNFTTVL,
  getBorrowed,
  getAPY,
};
