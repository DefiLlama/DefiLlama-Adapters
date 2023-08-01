const sui = require("../helper/chain/sui");
const BigNumber = require("bignumber.js");

const reserves = [
    "0xab644b5fd11aa11e930d1c7bc903ef609a9feaf9ffe1b23532ad8441854fbfaf",
    "0xeb3903f7748ace73429bd52a70fff278aac1725d3b58afa781f25ce3450ac203",
]


async function borrow() {
    const { api } = arguments[3]

    for (const reserve of reserves) {
        const object = await sui.getObject(reserve)
        const coin = '0x' + object.fields.value.fields.coin_type
        const total_supply = object.fields.value.fields.borrow_balance.fields.total_supply
        let amount = new BigNumber(total_supply)
        if (coin == '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN') {
            amount = amount.div(Math.pow(10, 3)).integerValue()
        }
    
        api.add(coin, amount.toString());
    }

}


async function supply() {
    const { api } = arguments[3]

    for (const reserve of reserves) {
        const object = await sui.getObject(reserve)
        const coin = '0x' + object.fields.value.fields.coin_type
        const total_supply = object.fields.value.fields.supply_balance.fields.total_supply
        let amount = new BigNumber(total_supply)
        if (coin == '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN') {
            amount = amount.div(Math.pow(10, 3)).integerValue()
        }
    
        api.add(coin, amount);
    }

}

module.exports = {
    timetravel: false,
    sui: {
        tvl: supply,
        borrowed: borrow,
    },
};