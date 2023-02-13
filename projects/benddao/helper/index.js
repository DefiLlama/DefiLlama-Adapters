const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../../helper/unwrapLPs");

const abi = require("./abis");
const address = require("./address");
const BigNumber = require("bignumber.js");

async function tvl(chain, timestamp, chainBlocks, { api }) {
  const block = chainBlocks[api.chain];
  const addressMap = address[api.chain];

  const [{ output: simpleReservesData }, { output: simpleNftsData }] =
    await Promise.all([
      sdk.api.abi.call({
        target: addressMap.UiPoolDataProvider,
        params: [addressMap.LendPoolAddressProvider],
        abi: abi.UiPoolDataProvider.getSimpleReservesData,
      }),
      sdk.api.abi.call({
        target: addressMap.UiPoolDataProvider,
        params: [addressMap.LendPoolAddressProvider],
        abi: abi.UiPoolDataProvider.getSimpleNftsData,
      }),
    ]);

  const toa = [
    ...simpleNftsData.map((i) => [i.underlyingAsset, i.bNftAddress]),
    ...simpleReservesData.map((i) => [i.underlyingAsset, i.bTokenAddress]),
  ];

  const balances = sumTokens2({ api, tokensAndOwners: toa });

  const stakedNftForApeStaking = simpleNftsData.filter((d) => {
    return ["BAYC", "MAYC"].includes(d.symbol);
  });

  const [{ output: apeStakingStakedTotal }] = await Promise.all([
    sdk.api.abi.multiCall({
      calls: stakedNftForApeStaking.map((d) => {
        return {
          target: addressMap.ApeCoinStaking,
          params: [d.bNftAddress],
        };
      }),
      abi: abi.ApeCoinStaking.stakedTotal,
      requery: true,
    }),
  ]);

  apeStakingStakedTotal.forEach((d) => {
    balances[addressMap.apeCoin] = new BigNumber(
      balances[addressMap.apeCoin] || 0
    ).plus(d.output);
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
