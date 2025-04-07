const erc20Abi = {
    totalSupply: 'function totalSupply() view returns (uint256)'
  }
  
  const usdcAddress = '0x549943e04f40284185054145c6E4e9568C1D3241' 
  const twinUSDCAddress = '0x1b7678F6991b8dCcf9bB879929e12f1005d80E94'
  
  async function tvl(api) {
    const totalSupply = await api.call({
      abi: erc20Abi.totalSupply,
      target: twinUSDCAddress,
    })
    console.log('Total Supply:', totalSupply)
    return {
      [`berachain:${usdcAddress}`]: totalSupply.toString()
    }
  }
  
  module.exports = {
    misrepresentedTokens: true,
    methodology: 'TVL is calculated based on the total supply of twinUSDC tokens, each representing 1 USDC in value.',
    berachain: {
      tvl
    }
  }