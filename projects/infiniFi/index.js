const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const ACCOUNTING = '0x7A5C5dbA4fbD0e1e1A2eCDBe752fAe55f6E842B3'
const abi  = "function totalAssetsValue() external view returns (uint256 _totalValue)"

async function tvl(api) {
    const totalAssetsValue  = await api.call(
        {
            abi: abi,
            target: ACCOUNTING
        }
    )
    
    api.add(USDC, totalAssetsValue/1e12)
}

module.exports = {
    methodology: 'TVL of the protocol is the value of all asssets deposited in the protocol kept in the accounting contract',
    ethereum: {
        tvl,
    }
}