const {sumTokens} = require("../helper/chain/bitcoin");
const {get} = require("../../projects/helper/http");

const addressBook = {
    bitcoin: 'https://api.btcvc.vishwanetwork.xyz/btc/address',
}

Object.keys(addressBook).forEach(async chain => {
    module.exports[chain] = {
        tvl: async () => {
            let addresses = (await get(addressBook[chain]))?.data || [];
            return await sumTokens({owners: addresses})
        }
    }
})
