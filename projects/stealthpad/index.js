const { sumUnknownTokens } = require('../helper/unknownTokens')
const abi = require('./abi.js')
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform, getFixBalances } = require('../helper/portedTokens')
const ADDRESSES = require('../helper/coreAssets.json')

const getReserves = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'

const factory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"

module.exports = {
  misrepresentedTokens: true,
  start: 17996063,
  methodology: `Counts liquidity in lp lock contracts`,
}

const config = {
  ethereum: { lockerManagerV1: '0x57136ec54ddafd1695479cae1140fbc6d5a916d1',},
}

async function getStakingBalance(stakingContract, stakingToken, lpContract, chain, decimals) {
  let transform = () => ADDRESSES.null;
  if (!transform) transform = await getChainTransform(chain)

  const [bal, reserveAmounts, token0, token1] = await Promise.all([
    sdk.api.erc20.balanceOf({
      target: stakingToken,
      owner: stakingContract,
      chain
    }),
    ...[getReserves, token0Abi, token1Abi].map(abi => sdk.api.abi.call({
      target: lpContract,
      abi,
      chain
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

Object.keys(config).forEach(chain => {
  const { lockerManagerV1, } = config[chain]
  module.exports[chain] = { tvl, staking }

  async function tvl(_, _b, _cb, { api, }) {
    const lpInfos = await api.fetchList({  lengthAbi: abi.lpLockerCount, itemAbi: abi.getLpLockData, target: lockerManagerV1, })
    const tokensAndOwners = [lpInfos].flat().filter(i => i.isLpToken).map(l => [l.token, l.contractAddress])
    return sumUnknownTokens({ api, tokensAndOwners, useDefaultCoreAssets: true, resolveLP: true, onlyLPs: true, })
  }

  async function staking(_, _b, _cb, { api, }) {
    const tokenLockerLength = parseInt((await sdk.api.abi.call({
      target: lockerManagerV1,
      abi: abi.tokenLockerCount,
      chain
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
      chain
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
      chain
    })).output

    const balances = {}

    for (let i = 0; i < tokenLockerLength; i++) {
      if (tokenLockers[i].success && lpForTokenLockers[i].success) {
        const { token, stakedBal } = await getStakingBalance(
          tokenLockers[i].output.contractAddress,
          tokenLockers[i].output.token,
          lpForTokenLockers[i].output,
          chain,
          0
        )
        sdk.util.sumSingleBalance(balances, token, stakedBal)
      }
    }

    const fixBalances = await getFixBalances(chain)
    fixBalances(balances)

    return balances
  }
})
