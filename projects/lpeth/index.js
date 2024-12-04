const LPETH_CONTRACT = "0xF3a75E087A92770b4150fFF14c6d36FB07796252"

async function tvl(api) {
    const liabilities = await api.call({
        abi: 'function liabilities() view returns (uint256)',
        target: LPETH_CONTRACT,
        params: []
    })

    api.add(LPETH_CONTRACT, liabilities)
}

module.exports = {
    methodology: 'Counts the amount of deposited ETH in the LPETH contract.',
    start: '21022294',
    arbitrum: {
        tvl
    }
}