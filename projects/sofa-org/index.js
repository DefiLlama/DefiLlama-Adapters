const { staking } = require('../helper/staking')
const { getConfig } = require('../helper/cache')

const chains = {
  ethereum: 'ethereum',
  arbitrum: 'arbitrum',
  bsc: 'bsc',
  polygon: 'polygon',
}

let config;
const tvl = async (api) => {
  if (!config) {
    config = await getConfig('sofa-org/vaults', 'https://raw.githubusercontent.com/sofa-org/sofa-gitbook/main/static/vaults.json')
  }

  const { vaults = [], aVaults = [], crvtokens=[], crvUSDVaults = [] } = config[chains[api.chain]]
  const tokens = await api.multiCall({ abi: 'address:collateral', calls: vaults })
  const tokens2 = await api.multiCall({ abi: 'address:collateral', calls: aVaults })
  const atokens = await api.multiCall({ abi: 'address:aToken', calls: aVaults })

  return api.sumTokens({ tokensAndOwners2: [[tokens, tokens2, atokens, crvtokens].flat(), [vaults, aVaults, aVaults, crvUSDVaults].flat()] })
}

Object.keys(chains).forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.ethereum.staking = staking([
  '0xBEFB3aAD1dfb1660444f0D76A91261EF755B2B86',
  '0xBFD58c8150cF7048D5C149fA2bAdDD194b8416fe',
  '0xfA49f859a012e8b1795A81B23b21Db0bD40e7770',
  '0x94Fe821E8Adde08aB97530D432Ff34A724FD7830',
  '0x4a5B4049a4aFae31278d36768704872f73dA67D1',
  '0x08c57aE48a89b6876A76dC618972Ef1602da7ED8',
  '0x2B9aeA129B85F51A468274e7271434A83c3BB6b4', // StRCH
], '0x57b96d4af698605563a4653d882635da59bf11af')
