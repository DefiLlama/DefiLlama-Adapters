const sdk = require('@defillama/sdk')

const vault = '0x9Ca1d6E730Eb9fbfD45c9FF5F0AC4E3d172d8F4d'

const tokens = [
  '0xae78736Cd615f374D3085123A210448E74Fc6393', // rETH
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  '0xD533a949740bb3306d119CC777fa900bA034cd52', // CRV
  '0x111111111117dC0aa78b770fA6A738034120C302', // 1INCH
  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', // YFI
  '0xba100000625a3754423978a60c9317c58a424e3D', // BAL
]

// Works across all DefiLlama SDK versions
async function tvl(_, _b, _cb, { api }) {
  // --- ERC-20 token balances ---
  const balances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: tokens.map(t => ({
      target: t,
      params: [vault],
    })),
    chain: 'ethereum',
  })

  balances.output.forEach((res, i) => {
    api.add(tokens[i], res.output)
  })

  // --- Native ETH balance ---
  const ethBalance = (
    await sdk.api.eth.getBalance({ target: vault, chain: 'ethereum' })
  ).output

  api.add('0x0000000000000000000000000000000000000000', ethBalance)
}

module.exports = {
  methodology:
    'Sums all ERC-20 tokens and native ETH held directly in the RockSolid rETH vault on Ethereum.',
  start: 1710000000, // replace with actual vault launch timestamp
  ethereum: { tvl },
  timetravel: true,
  misrepresentedTokens: false,
}
