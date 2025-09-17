const { sumTokens2 } = require('../helper/unwrapLPs')

const tokens = ['0xC9b68d8ab057b52785cF0e8e983A2eaFE6858979'];
const owner = '0x1DC14e4261eCd7747Cbf6D2C8538a73371405D76';

module.exports = {
    eventum: {
        tvl: (api) => sumTokens2({ api, tokens, owner })
    }
}