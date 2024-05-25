const ADDRESSES = require('../helper/coreAssets.json')
const CONFIG_DATA = {
    base: {
        char: "0x20b048fA035D5763685D695e66aDF62c5D9F5055",
    },
    celo: {
        bct: "0x0CcB0071e8B8B716A2a5998aB4d97b83790873Fe",
        nct: ADDRESSES.celo.NCT,
        char: "0x50E85c754929840B58614F48e29C64BC78C58345",
    },
    polygon: {
        bct: "0x2F800Db0fdb5223b3C3f354886d907A671414A7F",
        nct: "0xD838290e877E0188a4A44700463419ED96c16107",
    },
    regen: {
        nct_bridge: "0xdC1Dfa22824Af4e423a558bbb6C53a31c3c11DCC"
    },
};
const TOKEN_DATA = {
    bct: {
        coingecko: "toucan-protocol-base-carbon-tonne",
        validUntil: 1709828986,
    },
    nct: {
        coingecko: "toucan-protocol-nature-carbon-tonne",
    },
    char: {
        coingecko: "biochar",
    },
};

module.exports = {
    CONFIG_DATA,
    TOKEN_DATA,
};
