const { getUniTVL, staking, } = require('./helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: `Tvl counts the tokens locked on AMM pools and staking counts the NR that has been staked. Data is pulled from the 'https://core.neuronswap.com/api/dashboard'`,
    klaytn: {
        tvl: getUniTVL({ factory: '0xe334e8c7073e9aaae3cab998eecca33f56df6621', useDefaultCoreAssets: true, }),
        staking: staking({
            tokens: ['0x340073962a8561cb9e0c271aab7e182d5f5af5c8'],
            owner: '0x92a47a5c6b742b2056f0f4afb7724112c83715e1',
            lps: ['0x908a4E95b447bD2e0fd7c020618Ab84b5d6FFc87'],
            useDefaultCoreAssets: true,
        }),
    },
};