const sdk = require('@defillama/sdk')
const { AbiCoder, ZeroAddress } = require('ethers')
const BigNumber = require('bignumber.js')
const { post } = require('../helper/http')

const RESERVE_STATE = '0x0000000000000000000000000000000000000812'
const TOKEN_INFO = '0x000000000000000000000000000000000000080c'
const coder = AbiCoder.defaultAbiCoder()
const reserveType = 'tuple(uint64 borrowYearlyRateBps, uint64 supplyYearlyRateBps, uint64 balance, uint64 utilizationBps, uint64 oraclePx, uint64 ltvBps, uint64 totalSupplied, uint64 totalBorrowed)'
const tokenType = 'tuple(string name, uint64[] spots, uint64 deployerTradingFeeShare, address deployer, address evmContract, uint8 szDecimals, uint8 weiDecimals, int8 evmExtraWeiDecimals)'

function getTvl(borrowed = false) {
  return async (api) => {
    const markets = await post('https://api.hyperliquid.xyz/info', { type: 'allBorrowLendReserveStates' })
    if (!Array.isArray(markets) || !markets.length)
      throw new Error('No Hyperliquid lending reserves returned')

    const provider = sdk.getProvider(api.chain)
    const blockTag = await api.getBlock()
    const read = async (target, token, type) => {
      const result = await provider.call({ to: target, data: coder.encode(['uint64'], [token]), blockTag })
      return coder.decode([type], result)[0]
    }

    for (const [token] of markets) {
      const [reserve, info] = await Promise.all([
        read(RESERVE_STATE, token, reserveType),
        read(TOKEN_INFO, token, tokenType),
      ])
      const amount = borrowed ? reserve.totalBorrowed : reserve.totalSupplied - reserve.totalBorrowed
      if (amount < 0n) throw new Error(`Negative net supply for Hyperliquid token ${token}`)
      if (amount === 0n) continue

      if (token === 0) {
        api.addCGToken('usd-coin', new BigNumber(amount.toString()).shiftedBy(-Number(info.weiDecimals)).toNumber())
      } else if (token === 150) {
        api.addGasToken(new BigNumber(amount.toString()).shiftedBy(18 - Number(info.weiDecimals)).toFixed(0, BigNumber.ROUND_DOWN))
      } else {
        if (info.evmContract === ZeroAddress)
          throw new Error(`No EVM token mapping for Hyperliquid token ${token}`)
        api.add(info.evmContract, new BigNumber(amount.toString()).shiftedBy(Number(info.evmExtraWeiDecimals)).toFixed(0, BigNumber.ROUND_DOWN))
      }
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Reads HyperCore lending reserves through the HyperEVM reserve-state precompile. ' +
    'TVL is total supplied assets, including collateral, minus outstanding borrows; debt is reported separately as borrowed. ' +
    'Includes manual lending and portfolio-margin lending in the same reserves. ' +
    'The info API is used only to discover reserve token indices; balances and token metadata are read on-chain.',
  hyperliquid: {
    tvl: getTvl(),
    borrowed: getTvl(true),
  },
}
