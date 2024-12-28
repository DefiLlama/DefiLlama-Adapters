const abi = require("../paraspace-v2/helper/abis");
const address = require("../paraspace-v2/helper/address");
const sdk = require("@defillama/sdk");

async function tvl(api) {
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

  const balances = {};
  const allStakes = []
  for (const stake of stakedAddress) {
    const stakeData = await api.call({
      target: ApeCoinStaking,
      params: stake,
      abi: abi.ApeCoinStaking.getAllStakes,
    });
    allStakes.push(stakeData);
  }

  const otherPools = {}
  allStakes.flat().forEach(({ poolId, tokenId, deposited }) => {
    if (poolId === '0') {
      sdk.util.sumSingleBalance(balances, ApeCoin, deposited, api.chain)
      return;
    }
    otherPools[`${poolId}-${tokenId}`] = deposited
  })
  Object.values(otherPools).forEach(v => sdk.util.sumSingleBalance(balances, ApeCoin, v, api.chain))

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
};
