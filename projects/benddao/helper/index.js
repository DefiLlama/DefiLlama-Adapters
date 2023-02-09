const sdk = require("@defillama/sdk");
const { sumTokens2, } = require('../../helper/unwrapLPs')

const abi = require("./abis");
const address = require("./address");

async function tvl(chain, timestamp, chainBlocks, { api }) {
  const { UiPoolDataProvider, LendPoolAddressProvider, } = address[api.chain]
  
  const balances = {}

  const [simpleReservesData, simpleNftsData] =
    await Promise.all([
      api.call({
        target: UiPoolDataProvider,
        params: LendPoolAddressProvider,
        abi: abi.UiPoolDataProvider.getSimpleReservesData,
      }),
      api.call({
        target: UiPoolDataProvider,
        params: LendPoolAddressProvider,
        abi: abi.UiPoolDataProvider.getSimpleNftsData,
      }),
    ]);

  const toa = simpleNftsData.map(i => ([i.underlyingAsset, i.bNftAddress]))
  simpleReservesData.forEach(i => toa.push([i.underlyingAsset, i.bTokenAddress]))
  return sumTokens2({ api, tokensAndOwners: toa })
}

async function borrowed(chain, timestamp, chainBlocks, { api }) {
  const balances = {}
  const { UiPoolDataProvider, LendPoolAddressProvider, } = address[api.chain]

  const [simpleReservesData] = await Promise.all([
    api.call({
      target: UiPoolDataProvider,
      params: LendPoolAddressProvider,
      abi: abi.UiPoolDataProvider.getSimpleReservesData,
    }),
  ]);

  simpleReservesData.forEach((d) => {
    sdk.util.sumSingleBalance(balances,d.underlyingAsset,d.totalVariableDebt, api.chain)
  });

  return balances;
}

module.exports = {
  tvl,
  borrowed,
};
