const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { getUniTVL } = require('../helper/unknownTokens');
const endpoint = 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange';

module.exports = {
    tvl: getUniTVL({
        factory: '0x1998E4b0F1F922367d8Ec20600ea2b86df55f34E',
        chain: 'fuse',
        coreAssets: [
            '0x0be9e53fd7edac9f859882afdda116645287c629',
            '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5',
            '0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA',
            '0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10',
            '0xa722c13135930332Eb3d749B2F0906559D2C5b99',
            '0x43b17749b246fd2a96de25d9e4184e27e09765b0',
        ]
    })
}


