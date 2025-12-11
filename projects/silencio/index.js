const { staking } = require('../helper/staking')
const { sumTokensExport, } = require('../helper/sumTokens')


const SLC_TOKEN_ADDRESS = '0x5c3126bfb9a68a7021d461230127470b3824886b'
const SLC_STAKING_ADDRESS = '0x0Ac817b19b38df47118041d06BA2728d1492F726'


module.exports = {
    peaq: {
        tvl: (api) => {
            return api.sumTokens({ 
                owners: [SLC_STAKING_ADDRESS],
                tokens: [
                    SLC_TOKEN_ADDRESS
                ]
            })
        },
        staking: staking(SLC_STAKING_ADDRESS,SLC_TOKEN_ADDRESS)
    }
}