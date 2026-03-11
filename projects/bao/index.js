const sdk = require("@defillama/sdk");
const { sumTokens, unwrapLPsAuto,  } = require('../helper/unwrapLPs')
const abi = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accBaoPerShare)",
    "poolLength": "uint256:poolLength"
  };const erc20 = require('./../helper/abis/erc20.json')

const masterChef = '0xBD530a1c060DC600b951f16dc656E4EA451d1A2D'
const xdaiMasterChef = '0xf712a82DD8e2Ac923299193e9d6dAEda2d5a32fd'

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    return getTvl(chain, chainBlocks[chain], ethBlock)
  }
}

async function getTvl(chain, block, ethBlock) {
  const owner = chain === 'xdai' ? xdaiMasterChef : masterChef
  const { output: poolLength } = await sdk.api.abi.call({
    target: owner,
    abi: abi.poolLength,
    chain, block,
  });
  const calls = []
  const toa = []
  for (let i = 0; i < poolLength; i++)
    calls.push({ params: i })
  let { output: tokens } = await sdk.api.abi.multiCall({
    target: owner,
    abi: abi.poolInfo,
    calls,
    chain, block,
  })
  tokens.forEach(t => toa.push([t.output[0], owner]))
  if (chain !== 'xdai') {
    return sumTokens({}, toa, block, chain)
  }

  const balances = {}
  await sumTokens(balances, toa, block, chain)
  const tokenMapping = {}
  const tokenNameMapping = {}
  Object.keys(balances).forEach(i => {
    if (!i.startsWith('xdai'))  return; // we want to resolve LP tokens only, ignore all others 
    const bareToken = stripTokenHeader(i).toLowerCase()
    tokenMapping[bareToken] = i
  })
  const { output: tokenNames } = await sdk.api.abi.multiCall({
    abi: erc20.name,
    calls: Object.keys(tokenMapping).map(i => ({ target: i })),
    chain, block,
  })

  tokenNames.forEach(i => tokenNameMapping[i.input.target] = i.output)
  const ethBalances = {}
  
  // move bridged sushi LP balances to 'ethBalances'
  Object.entries(balances).forEach(([token, balance]) => {
    const bareToken = stripTokenHeader(token).toLowerCase()
    if (!/Token on/.test(tokenNameMapping[bareToken] || '')) return;
    delete balances[token]
    sdk.util.sumSingleBalance(ethBalances, bareToken, balance)
  })

  // resolve LPs
  if (chain === 'xdai')
    await Promise.all([
      unwrapLPsAuto({ balances, block, chain, }),
      // disabling resolving ETH balance resolving since we dont know how to resolve bridged LP address
      // unwrapLPsAuto({ balances: ethBalances, block: ethBlock, chain: 'ethereum', }),
    ])

  // merge balances
  // Object.entries(ethBalances).forEach(([token, balance]) => {
  //   sdk.util.sumSingleBalance(balances, token, balance)
  // })

  return balances
}

module.exports = {
  ethereum: {
    tvl: chainTvl('ethereum')
  },
  xdai: {
    tvl: chainTvl('xdai')
  },
}


function stripTokenHeader(token) {
  return token.indexOf(':') > -1 ? token.split(':')[1] : token
}