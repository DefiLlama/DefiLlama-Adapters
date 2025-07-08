const pools = Object.values({
  'aUsdc-Dai': '0x927860797d07b1C46fbBe7f6f73D45C7E1BFBb27',
  'USDC-Dai': '0x410d28fbcd00c677bae1cce2261546c8db4f6a2d',  
})

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address[]:getTokens', calls: pools })
  return api.sumTokens({ ownerTokens: tokens.map((t, i) => [t, pools[i]]) })
}

module.exports = {
  methodology: `Queries balances of StableSwap pools and sums their total value`,
  base: { tvl, }
};