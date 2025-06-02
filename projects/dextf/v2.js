const START_BLOCK = 12783638;
const { sumTokens2 } = require('../helper/unwrapLPs');

const config = {
  ethereum: { factory: '0xE0CF093Ce6649Ef94fe46726745346AFc25214D8', },
  avax: { factory: '0xEC143bb9FEE95B7726bF49108f085D02816e53eA', },
  era: { factory: '0x44E12D14b63806A817B1AA6886215caA6aa136a7', },
}

module.exports = async function tvl(api) {
  const { factory } = config[api.chain]

  const sets = await api.call({
    target: factory,
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
