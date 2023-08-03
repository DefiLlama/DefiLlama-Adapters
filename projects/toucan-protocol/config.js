const ADDRESSES = require('../helper/coreAssets.json')
const CONFIG_DATA = {
    celo: {
        bct: "0x0CcB0071e8B8B716A2a5998aB4d97b83790873Fe",
        nct: ADDRESSES.celo.NCT,
    },
    polygon: {
        bct: "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
        nct: "0xD838290e877E0188a4A44700463419ED96c16107",
    },
    regen: {
        nct_bridge: "0xdC1Dfa22824Af4e423a558bbb6C53a31c3c11DCC"
    },
};

module.exports = {
    CONFIG_DATA,
};
