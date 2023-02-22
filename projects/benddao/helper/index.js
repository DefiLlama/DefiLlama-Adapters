const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../../helper/unwrapLPs");

const abi = require("./abis");
const address = require("./address");

async function tvl(chain, timestamp, chainBlocks, { api }) {
  const addressMap = address[api.chain];

  const [simpleReservesData, bnftAssetList] =
    await Promise.all([
      api.call({
        target: addressMap.UiPoolDataProvider,
        params: [addressMap.LendPoolAddressProvider],
        abi: abi.UiPoolDataProvider.getSimpleReservesData,
      }),
      api.call({
        target: addressMap.BNFTRegistry,
        abi: abi.BNFTRegistry.getBNFTAssetList,
      }),
    ]);

  const bnftProxyList = await api.multiCall({
    calls: bnftAssetList,
    target: addressMap.BNFTRegistry,
    abi: abi.BNFTRegistry.bNftProxys,
  });

  const toa = [
    ...bnftAssetList.map((i, idx) => [i, bnftProxyList[idx]]),
    ...simpleReservesData.map((i) => [i.underlyingAsset, i.bTokenAddress]),
  ];

  return sumTokens2({ api, tokensAndOwners: toa });
}

async function borrowed(chain, timestamp, chainBlocks, { api }) {
  const balances = {};
  const addressMap = address[api.chain];

  const [simpleReservesData] = await Promise.all([
    api.call({
      target: addressMap.UiPoolDataProvider,
      params: addressMap.LendPoolAddressProvider,
      abi: abi.UiPoolDataProvider.getSimpleReservesData,
    }),
  ]);

  simpleReservesData.forEach((d) => {
    sdk.util.sumSingleBalance(
      balances,
      d.underlyingAsset,
      d.totalVariableDebt,
      api.chain
    );
  });

  return balances;
}

module.exports = {
  tvl,
  borrowed,
};
