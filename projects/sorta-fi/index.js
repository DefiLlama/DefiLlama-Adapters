const { compoundExports2 } = require("../helper/compound");
const sdk = require('@defillama/sdk')
const { stakings } = require('../helper/staking')

const contract = '0xE2D74A5f8101E6829409e4Fa8bBADCE2e0012C70'

function tvl(borrowed = false) {
  return async (api, ...args) => {

    const key = borrowed ? 'borrowed' : 'tvl'
    const comptrollers = await api.call({ abi: 'address[]:getControllers', target: contract })
    const tvls = comptrollers.map(i => compoundExports2({ comptroller: i })[key])
    return sdk.util.sumChainTvls(tvls)(api, ...args)
  }
}

const stakingContract = '0xd828eB62B026e3eFf70b867FfD8C86C0AEA9dBd8'
const token = '0x73c36aE64842Eaf4D9209dE10fdA21017b5f0709'

module.exports = {
  arbitrum: {
    tvl: tvl(),
    borrowed: tvl(true),
    staking: stakings([stakingContract], token),
  }
}
