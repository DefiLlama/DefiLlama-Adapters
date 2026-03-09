const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../../helper/unwrapLPs");

const abis = require("./abis");
const address = require("./address");

async function tvl(api) {
  const addressMap = address[api.chain];

  const [simpleReservesData, bnftAssetList] = await Promise.all([
    api.call({
      target: addressMap.UiPoolDataProvider,
      params: [addressMap.LendPoolAddressesProvider],
      abi: abis.UiPoolDataProvider.getSimpleReservesData,
    }),
    api.call({
      target: addressMap.BNFTRegistry,
      abi: abis.BNFTRegistry.getBNFTAssetList,
    }),
  ]);

  const bnftProxyList = await api.multiCall({
    calls: bnftAssetList,
    target: addressMap.BNFTRegistry,
    abi: abis.BNFTRegistry.bNftProxys,
  });

  const toa = [
    ...bnftAssetList.map((bnftAsset, idx) => {
      const bnftProxy = bnftProxyList[idx];
      return [bnftAsset, bnftProxy];
    }),
    ...simpleReservesData.map((reserve) => [
      reserve.underlyingAsset,
      reserve.bTokenAddress,
    ]),
  ];

  const balances = await sumTokens2({ api, tokensAndOwners: toa });

  return balances;
}

async function borrowed(api) {
  const balances = {};
  const addressMap = address[api.chain];

  const simpleReservesData = await api.call({
    target: addressMap.UiPoolDataProvider,
    params: [addressMap.LendPoolAddressesProvider],
    abi: abis.UiPoolDataProvider.getSimpleReservesData,
  });

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
}
