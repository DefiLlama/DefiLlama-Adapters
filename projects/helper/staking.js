const { sumTokensExport } = require('./unknownTokens');

function staking(stakingContract, stakingToken) {
    if (!Array.isArray(stakingContract)) stakingContract = [stakingContract]
    if (!Array.isArray(stakingToken)) stakingToken = [stakingToken]
    return (api) => api.sumTokens({ owners: stakingContract, tokens: stakingToken, })
}

function stakingPriceLP(stakingContract, stakingToken, options) {
    let owners = Array.isArray(stakingContract) ? stakingContract : [stakingContract]
    let tokens = Array.isArray(stakingToken) ? stakingToken : [stakingToken]
    let lps = []
    if (typeof options === 'string')
        lps = [options]
    else if (Array.isArray(options))
        lps = options
    else if (options && options.lpToken)
        lps = Array.isArray(options.lpToken) ? options.lpToken : [options.lpToken]

    return sumTokensExport({ owners, tokens, lps, useDefaultCoreAssets: true,  })
}


module.exports = {
    staking,
    stakings: staking,
    stakingPriceLP,
}
