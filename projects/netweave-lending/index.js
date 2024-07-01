const { compoundExports2 } = require("../helper/compound");
const sdk = require('@defillama/sdk')

const contract = '0x7034e562Cff40E456A8c479ab8D0e8a57D03491a'
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

module.exports = {
  mode: {
    tvl: totalTvl,
    borrowed: totalBorrowed,
  }
}

