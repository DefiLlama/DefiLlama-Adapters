const { staking } = require('../helper/staking')
const {getUniTVL} = require("../helper/unknownTokens");

const ADDRESSES = require('../helper/coreAssets.json')

const SAVING_CONTRACT = "0x7CCa96c630329c1972547e95B9f3F82eC31A916A"

module.exports = {
    q: {
        staking: staking(SAVING_CONTRACT, ADDRESSES.q.QUSD),
        tvl: getUniTVL({ coreAssets: [ADDRESSES.q.QUSD], factory: '0xfbb4E52FEcc90924c79F980eb24a9794ae4aFFA4', chain: 'q' }),
    },
};
