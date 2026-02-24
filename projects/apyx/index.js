module.exports = {
  misrepresentedTokens: true,
  start: '2026-02-17',
  methodology: "TVL is calculated as the total supply of apxUSD, the synthetic dollar issued by Apyx Protocol. apyUSD (ERC-4626 savings vault) is excluded to avoid double-counting, as it holds apxUSD which is already included in apxUSD's total supply.",
  ethereum: {
    tvl: async (api) => {
      const apxUSD = '0x98A878b1Cd98131B271883B390f68D2c90674665'
      const supply = await api.call({ abi: 'erc20:totalSupply', target: apxUSD })
      api.addCGToken('usd-coin', Number(BigInt(supply) / BigInt(1e18)))
    },
  },
}
