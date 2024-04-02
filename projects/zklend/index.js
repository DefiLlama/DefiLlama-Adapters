const ADDRESSES = require('../helper/coreAssets.json')
const { multiCall, sumTokens } = require('../helper/chain/starknet')
const { marketAbi } = require('./abi');

const market = '0x4c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05'

const assets = [
    ADDRESSES.starknet.WBTC,
    ADDRESSES.starknet.ETH,
    ADDRESSES.starknet.USDC,
    ADDRESSES.starknet.DAI,
    ADDRESSES.starknet.USDT,
    ADDRESSES.starknet.WSTETH,
    ADDRESSES.starknet.STRK
]

async function tvl(api) {
    return sumTokens({ api, owner: market, tokens: assets })
}

async function staking(api) {
    return sumTokens({
        api,
        owner: market,
        tokens: [
            ADDRESSES.starknet.ZEND
        ]
    })
}

async function borrowed(api) {
    let data = await multiCall({ calls: assets, target: market, abi: marketAbi.get_total_debt_for_token });
    data = data.map(i => +i)
    api.addTokens(assets, data)
}

module.exports = {
    methodology: 'Value of user supplied asset on zkLend is considered as TVL',
    starknet: {
        tvl,
        borrowed,
        staking,
    },
}
