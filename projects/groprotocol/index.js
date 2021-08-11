const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const Controller = "0xCC5c60A319D33810b9EaB9764717EeF84deFB8F4";

const calcTvl = async (
  balances,
  block,
  token,
  vaultAdaptor,
  vault,
  totalAsset
) => {
  const tokens = (
    await sdk.api.abi.call({
      abi: token,
      target: vaultAdaptor,
      block,
    })
  ).output;

  const totalAssetsVaultAdaptor = (
    await sdk.api.abi.call({
      abi: totalAsset,
      target: vaultAdaptor,
      block,
    })
  ).output;

  const vaults = (
    await sdk.api.abi.call({
      abi: vault,
      target: vaultAdaptor,
      block,
    })
  ).output;

  const totalAssetsVault = (
    await sdk.api.abi.call({
      abi: totalAsset,
      target: vaults,
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, tokens, totalAssetsVaultAdaptor);
  sdk.util.sumSingleBalance(balances, tokens, totalAssetsVault);
};

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  // Curve Vault out of deadCoin Method at Controller Contract

  const curveVaultAdaptor = (
    await sdk.api.abi.call({
      abi: abi.curveVault,
      target: Controller,
      ethBlock,
    })
  ).output;

  await calcTvl(
    balances,
    ethBlock,
    abi.token,
    curveVaultAdaptor,
    abi.vault,
    abi.totalAssets
  );

  // Vaults in deadCoin Method at Controller Contract

  const deadCoin = (
    await sdk.api.abi.call({
      abi: abi.deadCoin,
      target: Controller,
      ethBlock,
    })
  ).output;

  for (let index = 0; index < deadCoin; index++) {
    const vaultsAdaptor = (
      await sdk.api.abi.call({
        abi: abi.underlyingVaults,
        target: Controller,
        params: index,
        ethBlock,
      })
    ).output;

    await calcTvl(
      balances,
      ethBlock,
      abi.token,
      vaultsAdaptor,
      abi.vault,
      abi.totalAssets
    );
  }

  return balances;
};

module.exports = {
  eth: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
