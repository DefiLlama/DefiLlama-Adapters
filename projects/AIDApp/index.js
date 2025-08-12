const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const CORE_POOL_ADDRESS = "0xC439be7A5623bA800E7450F2cb6eDBc5A1983685"

module.exports = {
    methodology: 'counts the number of NATIVE tokens in the Pool Bonding contract.',
    core: {
        tvl:sumTokensExport({ owner: CORE_POOL_ADDRESS, tokens: [nullAddress]}),
    }
}