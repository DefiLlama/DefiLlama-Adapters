const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../../helper/unwrapLPs");

const abi = require("./abis");
const address = require("./address");

async function tvl(api) {
  const addressMap = address[api.chain];

  const [simpleReservesData, bnftAssetList] = await Promise.all([
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

  // cause stNFT do not have price, it should use the underlying asset price
  const stNFTMap = {
    [addressMap.StBAYC.toLowerCase()]: addressMap.BAYC.toLowerCase(),
    [addressMap.StMAYC.toLowerCase()]: addressMap.MAYC.toLowerCase(),
    [addressMap.StBAKC.toLowerCase()]: addressMap.BAKC.toLowerCase(),
  };

  for (const asset in balances) {
    const underlyingAsset = stNFTMap[asset];
    if (underlyingAsset) {
      sdk.util.sumSingleBalance(balances, underlyingAsset, balances[asset]);
      delete balances[asset];
    }
  }

  return balances;
}

async function borrowed(api) {
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
