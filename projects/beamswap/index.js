const sdk = require('@defillama/sdk')
const { getUniTVL } = require('../helper/unknownTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const GLINT_TOKEN = "0xcd3B51D98478D53F4515A306bE565c6EebeF1D58"
const SHARE_CONTRACT = "0x4204cAd97732282d261FbB7088e07557810A6408"
const chain = 'moonbeam'

async function stablePoolTVL(_, _b, { [chain]: block }) {
  const pools = [
    '0x8273De7090C7067f3aE1b6602EeDbd2dbC02C48f', //  multichain 3 pool
    '0x09A793cCa9D98b14350F2a767Eb5736AA6B6F921', // nomad 3 pool
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

const dexTVL = getUniTVL({
  factory: "0x985BcA32293A7A496300a48081947321177a86FD",
  chain: "moonbeam",
  useDefaultCoreAssets: true,
})


module.exports = {
  misrepresentedTokens: true,
  timetravel: true,
  incentivized: true,
  methodology:
    "Factory address (0x985BcA32293A7A496300a48081947321177a86FD) is used to find the LP pairs. TVL is equal to the liquidity on the AMM & Staking balance is equal to the amount of GLINT staked within the SHARE token contract(0x4204cAd97732282d261FbB7088e07557810A6408)",
  moonbeam: {
    tvl: sdk.util.sumChainTvls([dexTVL, stablePoolTVL]),
    staking: staking(SHARE_CONTRACT, GLINT_TOKEN, 'moonbeam')
  },
};

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