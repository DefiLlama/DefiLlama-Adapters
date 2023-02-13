const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../../helper/unwrapLPs");

const abi = require("./abis");
const address = require("./address");
const BigNumber = require("bignumber.js");

async function tvl(chain, timestamp, chainBlocks, { api }) {
  const block = chainBlocks[api.chain];
  const addressMap = address[api.chain];

  const [{ output: simpleReservesData }, { output: bnftAssetList }] =
    await Promise.all([
      sdk.api.abi.call({
        target: addressMap.UiPoolDataProvider,
        params: [addressMap.LendPoolAddressProvider],
        abi: abi.UiPoolDataProvider.getSimpleReservesData,
      }),
      sdk.api.abi.call({
        target: addressMap.BNFTRegistry,
        params: [],
        abi: abi.BNFTRegistry.getBNFTAssetList,
      }),
    ]);

  const { output: bnftProxyList } = await sdk.api.abi.multiCall({
    calls: bnftAssetList.map((d) => ({
      target: addressMap.BNFTRegistry,
      params: [d],
    })),
    abi: abi.BNFTRegistry.bNftProxys,
  });

  const toa = [
    ...bnftAssetList.map((i, idx) => [i, bnftProxyList[idx].output]),
    ...simpleReservesData.map((i) => [i.underlyingAsset, i.bTokenAddress]),
  ];

  const balances = await sumTokens2({ api, tokensAndOwners: toa });

  const [{ output: apeStakingStakedTotal }] = await Promise.all([
    sdk.api.abi.multiCall({
      calls: bnftProxyList.map((d) => {
        return {
          target: addressMap.ApeCoinStaking,
          params: [d.output],
        };
      }),
      abi: abi.ApeCoinStaking.stakedTotal,
    }),
  ]);

  apeStakingStakedTotal.forEach((d) => {
    sdk.util.sumSingleBalance(
      balances,
      addressMap.ApeCoin,
      d.output,
      api.chain
    );
  });

  return balances;
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
