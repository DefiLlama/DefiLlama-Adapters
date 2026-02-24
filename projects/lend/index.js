const LEND_FACTORY_ADDRESS = '0xbfbAff7afE2beA4fD130C4965B6eb28bd1DA4061';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

async function tvl(api) {
    const operationCount = await api.call({
        abi: "function operationCount() external view returns (uint256)",
        target: LEND_FACTORY_ADDRESS,
    });

    let total = 0n;

    for (let i = 1; i <= operationCount; i++) {
        const totalRaised = await api.call({
            abi: "function usdcRaised(uint256) external view returns (uint256)",
            target: LEND_FACTORY_ADDRESS,
            params: [i]
        });

        total += BigInt(totalRaised)
    }

    api.add(USDC_ADDRESS, total)
}

module.exports = {
    methodology: 'Counts the total value raised through Lend Operations in USDC',
    ethereum: {
        tvl,
    }
}; 
