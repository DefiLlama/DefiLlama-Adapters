const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports } = require("../helper/compound");

module.exports = {
    bsc: {
        ...compoundExports(
            '0x4f3e801Bd57dC3D641E72f2774280b21d31F64e4',
            'bsc',
            '0x157822aC5fa0Efe98daa4b0A55450f4a182C10cA',
            ADDRESSES.bsc.WBNB
        )
    }
};