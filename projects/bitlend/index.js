const sdk = require('@defillama/sdk')

const CHAIN = 'bittorrent'

// Tokens
const ETH = '0x1249C65AfB11D179FFB3CE7D4eEDd1D9b98AD006'
const USDC_T = '0x935faA2FCec6Ab81265B301a30467Bbc804b43d3'
const TRX = '0xEdf53026aeA60f8F75FcA25f8830b7e2d6200662'

// Bitlend Markets
const bETH = '0xb65103C4B2Af563F9bBD8ad8CA8387d700673B6E'
const bUSDC_T = '0xd1dA3881282a954E7FCd5a23c89AF2978FCEFcF0'
const bTRX = '0xE73fb086C7Aa48b83372b028f0f35B06E77C7511'

async function tvl (timestamp, ethBlock, { bittorrent: block }) {
  const ethBalance = (
    await sdk.api.erc20.balanceOf({
      block,
      target: ETH,
      chain: CHAIN,
      owner: bETH
    })
  ).output

  const usdctBalance = (
    await sdk.api.erc20.balanceOf({
      block,
      target: USDC_T,
      chain: CHAIN,
      owner: bUSDC_T
    })
  ).output

  const trxBalance = (
    await sdk.api.erc20.balanceOf({
      block,
      target: TRX,
      chain: CHAIN,
      owner: bTRX
    })
  ).output

  return {
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': ethBalance,
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': usdctBalance,
    tron: trxBalance / 10e5
  }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Total staked tokens in Bitlend protocol.',
  start: 14069919,
  bittorrent: {
    tvl
  }
}
