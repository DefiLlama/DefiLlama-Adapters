async function tvl(api) {
    const registryAddress = '0x9786DB1486A2f67977eF1e3dfbd0Eb01e407Be7b';

    const pools = await api.call({
        abi: 'function getPoolAddresses() view returns (address[])',
        target: registryAddress,
    });

    const tokens = await api.fetchList({ lengthAbi: 'numTokens', itemAbi: 'tokens', calls: pools, groupedByInput: true, })
    const ownerTokens = pools.map((v, i) => [tokens[i], v])
    return api.sumTokens({ ownerTokens })
}


module.exports = {
    doublecounted: true,
    start: '2025-01-01',
    sonic: { tvl }
};
