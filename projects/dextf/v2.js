const START_BLOCK = 12783638;
const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = async function tvl(timestamp, block, _, { api }) {
  if (block <= START_BLOCK)
    return {};

  const sets = await api.call({
    target: '0xE0CF093Ce6649Ef94fe46726745346AFc25214D8',
    abi: 'address[]:getSets',
  })

  const components = await api.multiCall({
    abi: 'address[]:getComponents',
    calls: sets,
  })

  const toa = []
  components.forEach((tokens, i) => toa.push(...tokens.map(t => ([t, sets[i]]))))
  return sumTokens2({ api, tokensAndOwners: toa })
};
