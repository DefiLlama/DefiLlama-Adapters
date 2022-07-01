const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'kava'

const dexTVL = getUniTVL({
  factory: "0x30D70fFBbfD795B147842100be5564502285E31F",
  chain: "kava",
  coreAssets: [
    "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b", // WKAVA
    '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f', // USDC
  ],
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
