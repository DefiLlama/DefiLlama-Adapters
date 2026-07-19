const CONFIG = {
    ethereum: [
        '0xda2ffa104356688e74d9340519b8c17f00d7752e'
    ],
    polygon: [
        '0x4c5ca366e26409845624e29b62c388a06961a792'
    ],
    optimism: [
        '0x720f86f4B5b5d5d0ea3E5718EC43071d4d05134b'
    ]
}

const tvl = async (api) => {
    const tokens = CONFIG[api.chain];
    const supplies = await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' });
    api.add(tokens, supplies);
}

Object.keys(CONFIG).forEach((chain) => {
    module.exports[chain] = { tvl }
})
