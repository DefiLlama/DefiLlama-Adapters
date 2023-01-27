const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getParamCalls } = require('../helper/utils')
const { getFixBalancesSync } = require('../helper/portedTokens')

const YieldContract = "0xE4Baf69B887843aB6A0e82E8BAeA49010fF619af";
const LendingPool = "0xbc3534b076EDB8E8Ef254D81b81DC193c53057F7";
const LendingPoolV2 = "0x503fba251cdc4c06a1eeea4faf89e3fafc5923a6";

const ethTvl = async (timestamp, block, chainBlocks) => {
  const tokens = [nullAddress]
  const { output: length } = await sdk.api.abi.call({
    target: YieldContract,
    abi: abi.getNoOfErc20s, block,
  })

  const { output } = await sdk.api.abi.multiCall({
    target: YieldContract,
    abi: abi.erc20List,
    calls: getParamCalls(length), block,
  })

  output.forEach(i => tokens.push(i.output))
  return sumTokens2({ tokens, owner: YieldContract, block, })
};

const chain = 'bsc'

async function getReservesData(block) {
  const { output: tokens } = await sdk.api.abi.call({
    abi: abi.getReserves,
    target: LendingPool,
    chain, block,
  })

  const { output: reservesData } = await sdk.api.abi.multiCall({
    abi: abi.getReserveData,
    target: LendingPool,
    calls: tokens.map(i => ({ params: i })),
    chain, block,
  })

  return reservesData.map(({ input: { params: [token]}, output}) => {
    output.token = token
    return output
  })
}

async function tvl(_, _b, { bsc: block }) {
  const data = await getReservesData(block)
  const tokensAndOwners = data.map(i => ([i.token, i.mTokenAddress]))
  return sumTokens2({ tokensAndOwners, chain, block, })
}

async function borrowed(_, _b, { bsc: block }) {
  const balances = {}
  const data = await getReservesData(block)
  data.forEach(i => sdk.util.sumSingleBalance(balances,'bsc:'+i.token,i.totalBorrowsVariable))
  const fix = getFixBalancesSync(chain)
  return fix(balances)
}

async function tvlV2(_, _b, { bsc: block }) {
  const data = await getReservesDataV2(block)
  const tokensAndOwners = data.map(i => ([i.token, i.aTokenAddress]))
  return sumTokens2({ tokensAndOwners, chain, block, })
}

async function borrowedV2(_, _b, { bsc: block }) {
  const balances = {}
  const data = await getReservesDataV2(block)
  const { output: supplyVariable } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: data.map(i => ({ target: i.variableDebtTokenAddress})),
    chain, block,
  })
  const { output: supplyStable } = await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: data.map(i => ({ target: i.stableDebtTokenAddress})),
    chain, block,
  })
  data.forEach((i, idx) => {
    sdk.util.sumSingleBalance(balances,'bsc:'+i.token,supplyVariable[idx].output)
    sdk.util.sumSingleBalance(balances,'bsc:'+i.token,supplyStable[idx].output)
  })
  const fix = getFixBalancesSync(chain)
  return fix(balances)
}


async function getReservesDataV2(block) {
  const { output: tokens } = await sdk.api.abi.call({
    abi: abiv2.getReservesList,
    target: LendingPoolV2,
    chain, block,
  })

  const { output: reservesData } = await sdk.api.abi.multiCall({
    abi: abiv2.getReserveData,
    target: LendingPoolV2,
    calls: tokens.map(i => ({ params: i })),
    chain, block,
  })

  return reservesData.map(({ input: { params: [token]}, output}) => {
    output.token = token
    return output
  })
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
    borrowed: sdk.util.sumChainTvls([borrowed, borrowedV2]),
  },
};
