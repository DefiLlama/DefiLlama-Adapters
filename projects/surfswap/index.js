const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'kava'

const dexTVL = getUniTVL({
  factory: "0xc449665520C5a40C9E88c7BaDa149f02241B1f9F",
  chain: "kava",
  useDefaultCoreAssets: true,
})

async function stablePoolTVL(_, _b, { [chain]: block }) {
  const pools = [
    '0x62bf12869E145A862218eE7e28F942Cc7FaeC460', //  base 4 pool
  ]

  let { output: lpTokens } = await sdk.api.abi.multiCall({
    abi: abi.getLpToken,
    calls: pools.map(i => ({ target: i })),
    chain, block,
  })

  lpTokens = lpTokens.map(i => i.output.toLowerCase())

  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.getTokens,
    calls: pools.map(i => ({ target: i })),
    chain, block,
  })

  const toa = []
  tokens.forEach(res => {
    res.output.forEach(t => {
      if (lpTokens.includes(t.toLowerCase())) return;
      toa.push([t, res.input.target])
    })
  })

  return sumTokens2({ tokensAndOwners: toa, chain, block, })
}

module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: sdk.util.sumChainTvls([dexTVL, stablePoolTVL])
  }
}

const abi = {
  getTokens: {
    "inputs": [],
    "name": "getTokens",
    "outputs": [
      {
        "internalType": "contract IERC20[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  getLpToken: {
    "inputs": [],
    "name": "getLpToken",
    "outputs": [
      {
        "internalType": "contract LPToken",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
}
