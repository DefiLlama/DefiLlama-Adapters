const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { ohmTvl } = require('../helper/ohm')
const { uniTvlExport } = require('../helper/calculateUniTvl');
const { nullAddress } = require('../helper/unwrapLPs');


// Treasury backing the CNV price, similar to OHM so using the ohm wrapper
const treasury = '0x226e7af139a0f34c6771deb252f9988876ac1ced' 
const etherAddress = ADDRESSES.null
const cnv_token = '0x000000007a58f5f58e697e51ab0357bc9e260a04'
const stakingAddress = ADDRESSES.null
const treasuryTokens = [
    [ADDRESSES.ethereum.DAI, false], //DAI
    // ['0x0ab87046fBb341D058F17CBC4c1133F25a20a52f', false], //gOHM
]
const gemSwap_factory = '0x066a5cb7ddc6d55384e2f6ca13d5dd2cd2685cbd'

// Generic CRV position unwrapping, useful for a CVX position unwrapping
// CVX treasury position parameters
const cvxDOLA_3CRV_BaseRewardPool = '0x835f69e58087e5b6bffef182fe2bf959fe253c3c'

async function tvl(api) {
  return api.sumTokens({ owner: treasury, tokens: [nullAddress, cvxDOLA_3CRV_BaseRewardPool]})
}


module.exports = ohmTvl(treasury, treasuryTokens, 'ethereum', stakingAddress, cnv_token, undefined, undefined, true)
module.exports.ethereum.tvl = sdk.util.sumChainTvls([tvl, module.exports.ethereum.tvl, uniTvlExport(gemSwap_factory, undefined, true)])
delete module.exports.ethereum.staking
module.exports.methodology = 'Count the treasury assets backing the CNV price + LP assets in the AMM Gemswap'
