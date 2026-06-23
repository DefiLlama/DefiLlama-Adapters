const CONFIG = {
    era: [
        '0x57fD71a86522Dc06D6255537521886057c1772A3'
    ]
}

const tvl = async (api) => {
    try {
        const tokens = CONFIG[api.chain];
        const supplies = await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' });
        api.add(tokens, supplies);
    } catch (error) {
        console.error(`Error in ${api.chain}:`, error);
    }
}

Object.keys(CONFIG).forEach((chain) => {
    module.exports[chain] = { tvl }
})
