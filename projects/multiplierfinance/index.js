const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const YieldContract = "0xE4Baf69B887843aB6A0e82E8BAeA49010fF619af";
const LendingPool = "0xbc3534b076EDB8E8Ef254D81b81DC193c53057F7";
const LendingPoolV2 = "0x503fba251cdc4c06a1eeea4faf89e3fafc5923a6";

const ethTvl = async (api) => {
  const tokens = await api.fetchList({ lengthAbi: abi.getNoOfErc20s, itemAbi: abi.erc20List, target: YieldContract })
  tokens.push(nullAddress)
  return sumTokens2({ tokens, owner: YieldContract, })
};

async function getReservesData(api) {
  const tokens = await api.call({ abi: abi.getReserves, target: LendingPool, })
  const res = await api.multiCall({ abi: abi.getReserveData, target: LendingPool, calls: tokens, })
  tokens.map((v, i) => res[i].token = v)
  return res
}

async function tvl(api) {
  const data = await getReservesData(api)
  const tokensAndOwners = data.map(i => ([i.token, i.mTokenAddress]))
  return sumTokens2({ tokensAndOwners, api, })
}

async function borrowed(api) {
  const data = await getReservesData(api)
  data.forEach(i => api.add(i.token, i.totalBorrowsVariable))
  return api.getBalances()
}

async function tvlV2(api) {
  const data = await getReservesDataV2(api)
  const tokensAndOwners = data.map(i => ([i.token, i.aTokenAddress]))
  return sumTokens2({ tokensAndOwners, api, })
}

async function borrowedV2(api) {
  const data = await getReservesDataV2(api)
  const supplyVariable = await api.multiCall({ abi: 'erc20:totalSupply', calls: data.map(i => i.variableDebtTokenAddress), })
  const supplyStable = await api.multiCall({ abi: 'erc20:totalSupply', calls: data.map(i => i.stableDebtTokenAddress), })
  data.forEach((i, idx) => {
    api.add(i.token, supplyVariable[idx])
    api.add(i.token, supplyStable[idx])
  })
  return api.getBalances()
}


async function getReservesDataV2(api) {
  const tokens = await api.call({ abi: abiv2.getReservesList, target: LendingPoolV2, })
  const res = await api.multiCall({ abi: abiv2.getReserveData, target: LendingPoolV2, calls: tokens, })
  tokens.map((v, i) => res[i].token = v)
  return res
}

const abiv2 = {
  getReservesList: "address[]:getReservesList",
  getReserveData: "function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 variableBorrowIndex, uint128 currentLiquidityRate, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint8 id))",
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  bsc: {
    tvl: sdk.util.sumChainTvls([tvl, tvlV2]),
    borrowed: sdk.util.sumChainTvls([borrowedV2, ]),
  },
};
