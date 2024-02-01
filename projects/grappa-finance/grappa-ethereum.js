const { sumTokens2, } = require('../helper/unwrapLPs')

const START_BLOCK = 16555738; // grappa deployment block
const grappa = '0xe5fc332620c8ba031d697bd45f377589f633a255';

module.exports = async function ethereumTvl(timestamp, block, _1, { api }) {
  if (block < START_BLOCK) return {}
  // get all tokens
  const numTokens = await api.call({ abi: 'function lastAssetId() view returns (uint8)', target: grappa })
  let params = []
  for (let id = 1; id <= numTokens; id++) params.push(id)
  const tokens = await api.multiCall({ abi: 'function assets(uint8) view returns (address)', calls: params, target: grappa })
  // get all owners
  const numEngines = await api.call({ abi: 'function lastEngineId() view returns (uint8)', target: grappa })
  params = []
  for (let id = 1; id <= numEngines; id++) params.push(id)
  let owners = await api.multiCall({ abi: 'function engines(uint8) view returns (address)', calls: params, target: grappa })

  return sumTokens2({ tokens: tokens, owners, api })
}