const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const axios = require("axios")

const PSP = '0xcafe001067cdef266afb7eb5a286dcfd277f3de5'
const pools_url = 'https://api.paraswap.io/staking/pools/1'

// Less future-proof: only 4 pools at launch
// const sPSP_1 = '0x55A68016910A7Bcb0ed63775437e04d2bB70D570'
// const sPSP_3 = '0xea02DF45f56A690071022c45c95c46E7F61d3eAb'
// const sPSP_4 = '0x6b1D394Ca67fDB9C90BBd26FE692DdA4F4f53ECD'
// const sPSP_7 = '0x37b1E4590638A266591a9C11d6f945fe7A1adAA7'
// sPSP_tokens = [sPSP_1, sPSP_3, sPSP_4, sPSP_7]

async function staking(timestamp, ethBlock, chainBlocks) {  
  const {data} = await axios.get(pools_url)
  const pools = data.pools.map(p => p.address)

  const poolsBalances = (
    await sdk.api.abi.multiCall({
      calls: pools.map(sPSP => ({target: PSP, params: sPSP})),
      abi: 'erc20:balanceOf',
      block: ethBlock,
      chain: 'ethereum'
    })
  ).output
  
  const balances = {}
  poolsBalances.forEach(t => {
    const token = t.input.target
    balances[token] = (new BigNumber(balances[token] || "0").plus(new BigNumber(t.output)) ).toString(10)
  })
  return balances
}

module.exports = {
  methodology: "PSP can be staked in staking pools, one pool per Private Market Maker, to signal and share the PMM benefits",
  ethereum: {
    staking,
    tvl: () => ({})
  },
}
