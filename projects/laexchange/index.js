async function tvl(api) {
    const LAUNCHPOOL_CONTRACT = "0x82Bcfb5695a7E5c3cE2a9f49bFAf6e28BB23F486"
    const CURRENCY_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7" // USDT
    
    const {currV, TVL } = await api.call({
      target: LAUNCHPOOL_CONTRACT,
      abi: 'function calcTVL(address currency) view returns (uint256 currV, uint256 TVL)',
      params: [CURRENCY_ADDRESS]
    })
    api.addToken(CURRENCY_ADDRESS, TVL)
    return {
      'ethereum': TVL
    }
  }
  
  module.exports = {
    methodology: 'Calculates the total amount of ETH, USDT, USDC, and USDX deposited across various pools',
    misrepresentedTokens: true,
    ethereum: {
      tvl
    }
  }