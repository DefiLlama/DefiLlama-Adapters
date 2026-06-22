const { sumTokensExport } = require('../helper/unwrapLPs')
const { factories } = require('./constants')
const { cachedGraphQuery } = require('../helper/cache')

const ADDRESSES = require('../helper/coreAssets.json')

const GRAPHQL_URL = 'https://api.euclidprotocol.com/graphql';

const TokensQuery = `query Token_denoms($chain: String!) {
  token {
    token_denoms(chain_uids: [$chain]) {
      token_id
      denoms {
        chain_uid
        token_type {
          ... on NativeTokenType {
            native {
              denom
            }
          }
          ... on SmartTokenType {
            smart {
              contract_address
            }
          }
          ... on VoucherTokenType {
            voucher
          }
        }
      }
    }
  }
}`



async function factoryTvl(api, factoryAddress) {
    const res = await cachedGraphQuery('euclidprotocol/' + api.chain, GRAPHQL_URL, TokensQuery, { variables: { chain: api.chain } })
    const tokens = res.token.token_denoms.filter(token => !token.token_id.endsWith('.eucl'));

    const escrows = await api.multiCall({
        abi: 'function get_token_escrow(string calldata token_id) external view returns (address)',
        calls: tokens.map(token => ({
            target: factoryAddress,
            params: [token.token_id],
        }))
    })

    const tokensAndOwners = tokens.map((token, tokenIndex) => token.denoms.map(denom => {
      return [denom.token_type.smart?.contract_address || ADDRESSES.null, escrows[tokenIndex]]
    })).flat()
    
    return sumTokensExport({
        tokensAndOwners,
    })(api)
}
module.exports = {
    methodology: 'Total value of all coins held in the smart contracts of the protocol'
}

Object.keys(factories).forEach(chain => {
    module.exports[chain] = {
        tvl: (api) => factoryTvl(api, factories[chain].factory_address)
    }
})

