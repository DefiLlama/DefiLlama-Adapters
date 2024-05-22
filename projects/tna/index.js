const { sumTokens2, } = require('../helper/unwrapLPs')
async function tvl(api) {
    return sumTokens2({
        owners: [
            '0x48c78f36a5b42d215dddc94871d354805c485a18',
        ], tokens: ['0x48c78f36a5b42d215dddc94871d354805c485a18'], api,
    }) //wbtc
}
module.exports = {
    btr: { tvl, }
}