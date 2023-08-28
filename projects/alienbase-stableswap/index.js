const pools = Object.values({
  'aUsdc-Dai': '0x927860797d07b1C46fbBe7f6f73D45C7E1BFBb27',
})

async function tvl(_, _b, _cb, { api, }) {
  const tokens = await api.multiCall({ abi: 'address[]:getTokens', calls: pools })
  return api.sumTokens({ ownerTokens: tokens.map((t, i) => [t, pools[i]]) })
}

module.exports = {
  methodology: `Queries balances of StableSwap pools and sums their total value`,
  base: { tvl, }
};