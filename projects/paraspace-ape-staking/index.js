const abi = require("../paraspace/helper/abis");
const address = require("../paraspace/helper/address");
const sdk = require("@defillama/sdk");
const { BigNumber } = require("ethers");

const { uniqWith } = require("lodash");

async function tvl(_, _1, _cb, { api }) {
  const {
    UiPoolDataProvider,
    PoolAddressProvider,
    ApeCoinStaking,
    ApeCoin,
    P2PPairStaking,
    cAPE,
    Bayc,
    Bakc,
    Mayc,
  } = address[api.chain];
  let [reservesData] = await api.call({
    target: UiPoolDataProvider,
    params: PoolAddressProvider,
    abi: abi.UiPoolDataProvider.getReservesData,
  });

  const nMAYC = reservesData.find(
    (r) => r.underlyingAsset.toLowerCase() === Mayc.toLowerCase()
  ).xTokenAddress;
  const nBAYC = reservesData.find(
    (r) => r.underlyingAsset.toLowerCase() === Bayc.toLowerCase()
  ).xTokenAddress;
  const nBAKC = reservesData.find(
    (r) => r.underlyingAsset.toLowerCase() === Bakc.toLowerCase()
  ).xTokenAddress;

  const stakedAddress = [nBAYC, nMAYC, nBAKC, P2PPairStaking, cAPE];

  let totalStaked = BigNumber.from(0);
  const balances = {};

  const allStakes = await api.multiCall({
    calls: stakedAddress,
    target: ApeCoinStaking,
    abi: abi.ApeCoinStaking.getAllStakes,
  });

  uniqWith(
    allStakes.flat().filter((each) => each.poolId !== "0"),
    (a, b) => a.poolId === b.poolId && a.tokenId === b.tokenId
  ).forEach((data) => (totalStaked = totalStaked.add(data.deposited)));

  allStakes.forEach((stakes) => {
    stakes.forEach((data) => {
      if (data.poolId === "0") totalStaked = totalStaked.add(data.deposited);
    });
  });

  sdk.util.sumSingleBalance(balances, ApeCoin, totalStaked, api.chain);

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
};
