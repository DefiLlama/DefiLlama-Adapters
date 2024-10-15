const { _BASE_TOKEN_, _QUOTE_TOKEN_ } = require('./abis/dodo.json')
const { sumTokensExport, sumTokens2, } = require('./unwrapLPs');
const { sumTokensExport: uSumExport } = require('./unknownTokens')

function pool2(stakingContract, lpToken) {
    if (!Array.isArray(stakingContract)) stakingContract = [stakingContract]
    if (!Array.isArray(lpToken)) lpToken = [lpToken]
    if (arguments.length === 2) return uSumExport({ tokens: lpToken, owners: stakingContract, useDefaultCoreAssets: true })
    return pool2s(stakingContract, lpToken)
}

function pool2s(stakingContracts, lpTokens) {
    return async (api) => {
        return sumTokens2({ api, tokens: lpTokens, owners: stakingContracts, resolveLP: true})
    }
}

function pool2UniV3({ stakingAddress, }) {
    return sumTokensExport({ owner: stakingAddress, resolveUniV3: true })
}

module.exports = {
    pool2,
    pool2s,
    pool2UniV3,
}