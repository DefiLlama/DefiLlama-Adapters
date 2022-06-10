const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl');
module.exports = {
    oasis: {
        tvl: calculateUsdUniTvl(
            '0x9dd422B52618f4eDD13E08c840f2b6835F3C0585',
            'oasis',
            '0x5C78A65AD6D0eC6618788b6E8e211F31729111Ca',
            [
                '0xaC5487bFE2502eCc06e057912b6F4946471093b9',
            ],
            'oasis-network'
        )
    }
}