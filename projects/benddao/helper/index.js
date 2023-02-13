const sdk = require("@defillama/sdk");
const { sumTokens2, } = require('../../helper/unwrapLPs')

const abi = require("./abis");
const address = require("./address");

async function getTVL(balances, chain, timestamp, chainBlocks) {
  const block = chainBlocks[chain];

  const [
    { output: simpleReservesData },
    { output: simpleNftsData },
    { output: apeCoin },
  ] = await Promise.all([
    sdk.api.abi.call({
      target: address.UiPoolDataProvider[chain],
      params: [address.LendPoolAddressProvider[chain]],
      abi: abi.UiPoolDataProvider.getSimpleReservesData,
      block,
      chain,
    }),
    sdk.api.abi.call({
      target: address.UiPoolDataProvider[chain],
      params: [address.LendPoolAddressProvider[chain]],
      abi: abi.UiPoolDataProvider.getSimpleNftsData,
      block,
      chain,
    }),
    sdk.api.abi.call({
      target: address.ApeCoinStaking[chain],
      params: [],
      abi: abi.ApeCoinStaking.apeCoin,
      block,
      chain,
    }),
    sdk.api,
  ]);

  simpleReservesData.forEach((d) => {
    balances[d.underlyingAsset] = new BigNumber(
      balances[d.underlyingAsset] || 0
    ).plus(d.availableLiquidity);
  });

  const stakedNftForApeStaking = simpleNftsData.filter((d) => {
    return ["BAYC", "MAYC"].includes(d.symbol);
  });

  const [{ output: nftTotalSupplies }, { output: apeStakingStakedTotal }] =
    await Promise.all([
      sdk.api.abi.multiCall({
        calls: simpleNftsData.map((d) => {
          return {
            target: d.bNftAddress,
            params: [],
          };
        }),
        abi: "uint256:totalSupply",
        requery: true,
      }),
      sdk.api.abi.multiCall({
        calls: stakedNftForApeStaking.map((d) => {
          return {
            target: address.ApeCoinStaking[chain],
            params: [d.bNftAddress],
          };
        }),
        abi: abi.ApeCoinStaking.stakedTotal,
        requery: true,
      }),
    ]);

  const totalSupplyMap = nftTotalSupplies.reduce((acc, cur) => {
    acc[cur.input.target] = cur.output;
    return acc;
  }, Object.create(null));

  simpleNftsData.forEach((d) => {
    balances["ETHEREUM"] = new BigNumber(balances["ETHEREUM"] || 0).plus(
      new BigNumber(totalSupplyMap[d.bNftAddress])
        .multipliedBy(d.priceInEth)
        .shiftedBy(-18)
    );
  });

  apeStakingStakedTotal.forEach((d) => {
    balances[apeCoin] = new BigNumber(balances[apeCoin] || 0).plus(d.output);
  });

  return balances;
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
