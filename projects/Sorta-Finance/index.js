const { compoundExports2 } = require("../helper/compound");
const sdk = require('@defillama/sdk')
const { stakings } = require('../helper/staking')

const contract = '0xE2D74A5f8101E6829409e4Fa8bBADCE2e0012C70'
const abi = 'function getControllers() view returns(address[] c)'

const totalTvl = async(timestamp, ethBlock, chainBlocks, params) => {
  const api = params.api
  const cons = await api.multiCall({
    abi: abi,
    calls: [{target: contract}],
  })

  let tvls = []
  for (const c of cons[0]) {
    const tvlFn = compoundExports2({comptroller: c}).tvl
    tvls.push(tvlFn)
  }
  let totalFn = sdk.util.sumChainTvls(tvls)
  const total = await totalFn(timestamp, ethBlock, chainBlocks, params)
  return total
}

const totalBorrowed = async(timestamp, ethBlock, chainBlocks, params) => {
  const api = params.api
  const cons = await api.multiCall({
    abi: abi,
    calls: [{target: contract}],
  })

  let borrows = []
  for (const c of cons[0]) {
    const tvlFn = compoundExports2({comptroller: c}).borrowed
    borrows.push(tvlFn)
  }
  let totalFn = sdk.util.sumChainTvls(borrows)
  const total = await totalFn(timestamp, ethBlock, chainBlocks, params)

  return total
}

const stakingContract = '0xd828eB62B026e3eFf70b867FfD8C86C0AEA9dBd8'
const token = '0x73c36aE64842Eaf4D9209dE10fdA21017b5f0709'

module.exports = {
  arbitrum: {
    tvl: totalTvl,
    borrowed: totalBorrowed,
    staking: stakings([stakingContract], token),
  }
}

