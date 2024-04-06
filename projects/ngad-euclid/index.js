const lrtConfig = '0xDabB6eC246C9572c30B11f77907006dA5CAe274E';
const lrtDepositPool = '0x26803cB8Bd2916EB58c3610caB50077A96D29947';
async function tvl(_, _1, _2, {api}) {
    const supportedAssets = await api.call({
        abi: 'function getSupportedAssets() view returns (address[])',
        target: lrtConfig
    });
    const depositedAssetAmounts = await api.multiCall({
        abi: 'function getTotalAssetDeposits(address _asset) view returns (uint256)',
        target: lrtDepositPool,
        calls: supportedAssets
    });

    api.addTokens(supportedAssets, depositedAssetAmounts);
}

module.exports = {
    ethereum: {
        tvl
    }
};

