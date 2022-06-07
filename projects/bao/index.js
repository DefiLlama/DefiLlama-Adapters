const sdk = require("@defillama/sdk");
const { sumTokens } = require('../helper/unwrapLPs')
const abi = require('./abi.json')

const masterChef = '0xBD530a1c060DC600b951f16dc656E4EA451d1A2D'
const xdaiMasterChef = '0xf712a82DD8e2Ac923299193e9d6dAEda2d5a32fd'

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    return getTvl(chain, chainBlocks[chain])
  }
}

async function getTvl(chain, block,) {
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
  const { output: tokens } = await sdk.api.abi.multiCall({
    target: owner,
    abi: abi.poolInfo,
    calls,
    chain, block,
  });
  tokens.forEach(t => toa.push([t.output[0], owner]))
  return sumTokens({}, toa, block, chain, undefined, { resolveLP: true })
}

module.exports = {
  ethereum: {
    tvl: chainTvl('ethereum')
  },
  xdai: {
    tvl: chainTvl('xdai')
  },
}
