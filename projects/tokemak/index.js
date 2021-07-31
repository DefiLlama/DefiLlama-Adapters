const sdk = require('@defillama/sdk')

const degenesisContract = "0xc803737D3E12CC4034Dde0B2457684322100Ac38"
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

async function tvl(timestamp, block) {
  const wethBalance = await sdk.api.erc20.balanceOf({
    target: weth,
    owner: degenesisContract,
    block
  })
  const usdcBalance = await sdk.api.erc20.balanceOf({
    target: usdc,
    owner: degenesisContract,
    block
  })
  
  return {
    [weth]: wethBalance.output,
    [usdc]: usdcBalance.output
  }
}

module.exports = {
    ethereum:{
        tvl,
      },
      tvl,
  }