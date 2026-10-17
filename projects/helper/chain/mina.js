const sdk = require('@defillama/sdk')
const { post } = require('../http')

const GRAPHQL = 'https://api.minascan.io/node/mainnet/v1/graphql'
const MINA_DECIMALS = 9

// total MINA (whole coins) held by an account; unknown accounts return null, i.e. 0
async function getMinaBalance(owner) {
  const { data, errors } = await post(GRAPHQL, {
    query: 'query($pk: PublicKey!) { account(publicKey: $pk) { balance { total } } }',
    variables: { pk: owner },
  })
  if (errors?.length) throw new Error(`mina: ${errors[0].message}`)
  return Number(data.account?.balance?.total ?? 0) / 10 ** MINA_DECIMALS
}

async function sumTokens({ balances = {}, owners = [], api }) {
  if (api) balances = api.getBalances()
  for (const owner of owners)
    sdk.util.sumSingleBalance(balances, 'mina-protocol', await getMinaBalance(owner))
  return balances
}

module.exports = {
  getMinaBalance,
  sumTokens,
}
