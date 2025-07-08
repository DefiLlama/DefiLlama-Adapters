const SUBGRAPH_GARDENS_XDAI = "G4EbcSW588SUy8CdprPPxCN69VN8mxvnwt4oyR6YpGza";
const { cachedGraphQuery } = require('../helper/cache')

const ALL_ORGS_GQL = `
  query allOrgs($lastId: ID) {
    organizations(first: 1000, where: { id_gt: $lastId, active: true }) {
      id
      token {
        name
        id
      }
      config {
        conviction {
          requestToken {
            id
            name
          }
          fundsManager
        }
      }
      proposalCount
      active
    }
  }
`

async function tvl(api) {
  const orgs = await cachedGraphQuery('gardensdao', SUBGRAPH_GARDENS_XDAI, ALL_ORGS_GQL, { fetchById: true})
  const toa = []
  orgs.forEach(({config: { conviction } = {}} = {}) => {
    const token = conviction?.requestToken.id
    const owner = conviction?.fundsManager
    if (token && owner)
      toa.push([token, owner])
  })
  return api.sumTokens({ tokensAndOwners: toa })

}

module.exports = {
  xdai: {
    tvl,
  },
};