const { sumTokens2, } = require('../helper/unwrapLPs')
async function tvl(api) {
    return sumTokens2({
        owners: [
            '0x48c78f36a5b42d215dddc94871d354805c485a18','0x048d86f26952ab5e1f601f897bc9512a1e7fa675'
        ], tokens: ['0x48c78f36a5b42d215dddc94871d354805c485a18'], api,
    }) //wbtc
}
module.exports = {
    btr: { tvl, }
}