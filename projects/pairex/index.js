const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs')

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

module.exports = {
    start: '2023-03-15',  //  15/03/2023 @ 04:00am (UTC)
    arbitrum: {
        tvl: sumTokensExport({ tokens, owners: contracts }),
    },
    hallmarks: [
        [1678852800, "Arbitrum Pairex Launch"]
    ]
}
