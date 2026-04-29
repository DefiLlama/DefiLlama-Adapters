const ADDRESSES = require('../helper/coreAssets.json')
const {sumTokens2} = require('../helper/unwrapLPs')

const ERC20_MANAGER = '0x16fCff97822fcf3345Fa76D29c229b11C49EaE12';
const WRAPPED_VARA = '0xB67010F2246814e5c39593ac23A925D9e9d7E5aD';

async function tvl(api) {
    await sumTokens2({
        api,
        owners: [ERC20_MANAGER],
        tokens: [
            ADDRESSES.ethereum.USDC,
            ADDRESSES.ethereum.USDT,
            ADDRESSES.ethereum.WETH,
        ],
    })

    const wrappedVaraSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: WRAPPED_VARA,
    })

    api.add(WRAPPED_VARA, wrappedVaraSupply)

    return api.getBalances()
}

module.exports = {
    methodology: [
        'TVL is calculated as the sum of the value of tokens locked on the ERC20Manager contract and the value of VARA tokens bridged from the Vara Network.',
        'Only tokens officially supported by the Vara ⇌ Ethereum Bridge are counted.'
    ].join(' '),
    ethereum: {tvl},
};
