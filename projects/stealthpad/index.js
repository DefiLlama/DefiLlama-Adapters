const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform, getFixBalances, getFixBalancesSync } = require('../helper/portedTokens')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.js')

const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'

const lockerManagerV1 = "0x57136ec54ddafd1695479cae1140fbc6d5a916d1"
const factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"

async function getStakingBalance(stakingContract, stakingToken, lpContract, chain, block, decimals) {
  let transform = () => ADDRESSES.null;
  if (!transform) transform = await getChainTransform(chain)

  const [bal, reserveAmounts, token0, token1] = await Promise.all([
    sdk.api.erc20.balanceOf({
      target: stakingToken,
      owner: stakingContract,
      chain,
      block,
    }),
    ...[getReserves, token0Abi, token1Abi].map(abi => sdk.api.abi.call({
      target: lpContract,
      abi,
      chain,
      block
    }).then(o => o.output))
  ])
  let token, stakedBal;
  if (token0.toLowerCase() === stakingToken.toLowerCase()) {
    token = token1;
    stakedBal = BigNumber(bal.output).times(reserveAmounts[1]).div(reserveAmounts[0]).toFixed(0);
  } else {
    stakedBal = BigNumber(bal.output).times(reserveAmounts[0]).div(reserveAmounts[1]).toFixed(0);
    token = token0
  }
  if (decimals !== undefined) {
    stakedBal = Number(stakedBal) / (10 ** decimals)
  }

  return { token, stakedBal }
}

function tvl(chain = "ethereum") {
  return async (timestamp, _ethBlock, { [chain]: block }) => {
    // config
    const tokenLockerLength = parseInt((await sdk.api.abi.call({
      target: lockerManagerV1,
      abi: abi.tokenLockerCount,
      chain,
      block,
    })).output)

    const callTokenLockers = []
    for (let i = 0; i < tokenLockerLength; i++) {
      callTokenLockers.push({
        params: i
      })
    }
    const tokenLockers = (await sdk.api.abi.multiCall({
      target: lockerManagerV1,
      abi: abi.getTokenLockData,
      calls: callTokenLockers,
      chain,
      block
    })).output

    const lpForTokenLockers = (await sdk.api.abi.multiCall({
      target: factory,
      abi: abi.getPair,
      calls: tokenLockers.map(tokenLocker => ({
        params: [
          tokenLocker.output.token,
          ADDRESSES.ethereum.WETH,
        ]
      })),
      chain,
      block
    })).output

    const lpLockerLength = parseInt((await sdk.api.abi.call({
      target: lockerManagerV1,
      abi: abi.lpLockerCount,
      chain,
      block
    })).output)

    const callLpLockers = []
    for (let i = 0; i < lpLockerLength; i++) {
      callLpLockers.push({
        params: i
      })
    }
    const lpLockers = (await sdk.api.abi.multiCall({
      target: lockerManagerV1,
      abi: abi.getLpLockData,
      calls: callLpLockers,
      chain,
      block
    })).output

    const balances = {}

    // stakings
    for (let i = 0; i < tokenLockerLength; i++) {
      if (tokenLockers[i].success && lpForTokenLockers[i].success) {
        const { token, stakedBal } = await getStakingBalance(
          tokenLockers[i].output.contractAddress,
          tokenLockers[i].output.token,
          lpForTokenLockers[i].output,
          chain,
          block,
          0
        )
        sdk.util.sumSingleBalance(balances, token, stakedBal)
      }
    }

    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)

    // pools
    const stakingContracts = lpLockers.map(lpLocker => lpLocker.output.contractAddress)
    const lpTokens = lpLockers.map(lpLocker => lpLocker.output.token)

    await sumTokensAndLPsSharedOwners(balances, lpTokens.map(token => [token, true]), stakingContracts, block, chain, addr => `${chain}:${addr}`)
    const fixBalancesForPool2 = getFixBalancesSync(chain)
    fixBalancesForPool2(balances)

    return balances
  }
}

module.exports = {
  start: 17996063,

  methodology: `Counts liquidity in lp lock contracts and tokens in the token lock contracts`,

  ethereum: {
    tvl: tvl()
  }
}
