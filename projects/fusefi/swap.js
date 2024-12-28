const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
    tvl: getUniTVL({
        factory: '0x1998E4b0F1F922367d8Ec20600ea2b86df55f34E',
        useDefaultCoreAssets: true,
    })
}


