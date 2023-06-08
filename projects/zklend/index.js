const { BigNumber } = require("bignumber.js");
const { multiCall, sumTokens } = require('../helper/chain/starknet')
const { marketAbi } = require('./abi');

const valueToBigNumber = (amount) => {
    if (amount instanceof BigNumber) {
        return amount;
    }
    return new BigNumber(amount);
}
const market = '0x4c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05'

const assets = [
    '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
    '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3',
    '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8'
]

async function tvl(_, _1, _2, { api }) {
    return sumTokens({ api, owner: market, tokens: assets })
}

async function borrowed(_, _1, _2, { api }) {
    let data = await multiCall({ calls: assets, target: market, abi: marketAbi.get_total_debt_for_token });
    data = data.map(i => valueToBigNumber(i).toNumber())
    api.addTokens(assets, data)
}

module.exports = {
    methodology: 'Value of user supplied asset on zkLend is considered as TVL',
    starknet: {
        tvl,
        borrowed
    },
}
