const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const abi = require("./abis");
const address = require("./address");

async function getTVL(balances, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];

  const [{ output: simpleReservesData }, { output: simpleNftsData }] =
    await Promise.all([
      sdk.api.abi.call({
        target: address.UiPoolDataProvider[chain],
        params: [address.LendPoolAddressProvider[chain]],
        abi: abi.UiPoolDataProvider.find(
          (a) => a.name === "getSimpleReservesData"
        ),
        block,
        chain,
      }),
      sdk.api.abi.call({
        target: address.UiPoolDataProvider[chain],
        params: [address.LendPoolAddressProvider[chain]],
        abi: abi.UiPoolDataProvider.find((a) => a.name === "getSimpleNftsData"),
        block,
        chain,
      }),
    ]);

  simpleReservesData.forEach((d) => {
    balances[d.underlyingAsset] = new BigNumber(
      balances[d.underlyingAsset] || 0
    ).plus(d.availableLiquidity);
  });

  simpleNftsData.forEach((d) => {
    balances["ETHEREUM"] = new BigNumber(balances["ETHEREUM"] || 0).plus(
      new BigNumber(d.totalCollateral).multipliedBy(d.priceInEth).shiftedBy(-18)
    );
  });

  return balances;
}

async function getBorrowed(balances, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];

  const [{ output: simpleReservesData }] = await Promise.all([
    sdk.api.abi.call({
      target: address.UiPoolDataProvider[chain],
      params: [address.LendPoolAddressProvider[chain]],
      abi: abi.UiPoolDataProvider.find(
        (a) => a.name === "getSimpleReservesData"
      ),
      block,
      chain,
    }),
  ]);

  simpleReservesData.forEach((d) => {
    balances[d.underlyingAsset] = new BigNumber(
      balances[d.underlyingAsset] || 0
    ).plus(d.totalVariableDebt);
  });

  return balances;
}

module.exports = {
  getTVL,
  getBorrowed,
};
