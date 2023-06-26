const ADDRESSES = require('../helper/coreAssets.json')
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
    ADDRESSES.starknet.WBTC,
    ADDRESSES.starknet.ETH,
    ADDRESSES.starknet.USDC,
    ADDRESSES.starknet.DAI,
    ADDRESSES.starknet.USDT
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
