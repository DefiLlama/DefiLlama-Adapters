const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const BORROWING_CONTRACT = "0xb9c29d9A24B233C53020891D47F82043da615Dcc"

module.exports = {
    q: { tvl: sumTokensExport({ owner: BORROWING_CONTRACT, tokens: Object.values(ADDRESSES.q)}) },
};
