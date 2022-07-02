const { getUniTVL } = require('./helper/unknownTokens')
const { staking } = require('./helper/staking')
const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('./helper/unwrapLPs')

const dexTVL = getUniTVL({
  factory: "0x68A384D826D3678f78BB9FB1533c7E9577dACc0E",
  chain: "moonbeam",
  coreAssets: [
    "0xAcc15dC74880C9944775448304B263D191c6077F", // WGLMR
    '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', // USDC
    "0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2", // Stella token
  ],
})

const chain = 'moonbeam'
async function stablePoolTVL(_, _b, { [chain]: block }) {
  const pools = [
    '0x422b5b7a15fb12c518aa29f9def640b4773427f8', //  4 pool
    '0xb86271571c90ad4e0c9776228437340b42623402', // ETH
    '0x7FbE3126C03444D43fC403626ec81E3e809E6b46', // MAI B4P
  ]

  let { output: lpTokens } = await sdk.api.abi.multiCall({
    abi: abi.getLpToken,
    calls: pools.map(i => ({target: i })),
    chain, block,
  })

  lpTokens = lpTokens.map(i => i.output.toLowerCase())

  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.getTokens,
    calls: pools.map(i => ({target: i })),
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
  moonbeam: {
    tvl: sdk.util.sumChainTvls([dexTVL, stablePoolTVL]),
    staking: staking('0x06A3b410b681c82417A906993aCeFb91bAB6A080', '0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2', 'moonbeam')
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