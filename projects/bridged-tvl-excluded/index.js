const { sumTokens2 } = require('../helper/unwrapLPs')

// [token, owner]
const config = {
    base: [
        ['0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', '0x06A19654e0872Ba71c2261EA691Ecf8a0c677156'], // DEGEN
        ['0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', '0x7d00D30269fC62Ab5fAb54418feeDBdc71FDb25f'], // DEGEN
        ['0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', '0x6be3ffea7996f0f50b3e5f79372b44d1fd78db30'], // DEGEN
        ['0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', '0x06A19654e0872Ba71c2261EA691Ecf8a0c677156'], // DEGEN
    ]
}

module.exports = {};
Object.keys(config).map(chain => {
    module.exports[chain] = {
        tvl: async (api) => sumTokens2({ api, tokensAndOwners: config[chain] })
    }
}) 