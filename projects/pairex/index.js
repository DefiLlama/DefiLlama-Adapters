const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json');
const { transformArbitrumAddress } = require('../helper/portedTokens');

const contracts = [
    '0x154fDc2e0c4A2e4b39AFc329f0df88499d96F665',
    '0x9CC1b358E39651F118AA02126648f4a770B7432D',
    '0x2Ca07638acDa0B2bEa7B6a06F135476BDdd7101B',
    '0xA7dE0DD19004b430cC8C920fCA9F5FDE5A66379b',
    '0x35DD17F0d9098fc5B24D6328122B4C9ea5dD7DB5',
    '0x0a30067Ad5ff753F6887bBaF03b467C87CF62eF3'
]

const tokens = [
    ADDRESSES.arbitrum.USDT,
    ADDRESSES.arbitrum.LINK
]

async function tvl(block, chainBlocks) {
    const balances = {};

    const transform = await transformArbitrumAddress();

    let balanceOfCalls = [];
    contracts.forEach((contract) => {
        balanceOfCalls = [
            ...balanceOfCalls,
            ...tokens.map((token) => ({
                chain: 'arbitrum',
                target: token,
                params: contract,
                block: block
            }))
        ];
    });

    const balanceOfResult = await sdk.api.abi.multiCall({
        chain: 'arbitrum',
        calls: balanceOfCalls,
        abi: 'erc20:balanceOf',
        block: chainBlocks['arbitrum']
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResult, true, transform)

    return balances;
}

module.exports = {
    start: 1678852800,  //  15/03/2023 @ 04:00am (UTC)
    arbitrum: {
        tvl: tvl
    },
    hallmarks: [
        [1678852800, "Arbitrum Pairex Launch"]
    ]
}
