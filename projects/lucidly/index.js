async function tvl(api) {
    const registryAddress = '0x3C2A24c9296eC8B1fdb8039C937DaC7CBca3976c';

    const pools = await api.call({
        abi: 'function getPoolAddresses() view returns (address[])',
        target: registryAddress,
    });

    const tokens = await api.fetchList({ lengthAbi: 'numTokens', itemAbi: 'tokens', calls: pools, groupedByInput: true, })
    const ownerTokens = pools.map((v, i) => [tokens[i], v])
    return api.sumTokens({ ownerTokens })
}


module.exports = {
    start: 1693971707,
    ethereum: { tvl }
};
