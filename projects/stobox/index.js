const factory = '0x096D75d0501c3B1479FFe15569192CeC998223b4';

async function tvl(api) {
    const tokens = await api.call({
        abi: 'function generalTokenList() external view returns (address[])',
        target: factory,
    });

    const supplies = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: tokens,
    });

    api.add(tokens, supplies);
}

module.exports = {
    methodology: `Total Supply of all security tokens issued by Stobox.`,
    hallmarks: [["2026-02-04", "Arbitrum migration"]],
    arbitrum: { tvl },
    bsc: { tvl: () => ({}) },
    polygon: { tvl: () => ({}) },
};