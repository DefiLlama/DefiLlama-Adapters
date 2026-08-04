const { sumTokensExport } = require('../helper/unwrapLPs')
const routerContract = 'euclid1yvgh8xeju5dyr0zxlkvq09htvhjj20fncp5g58np4u25g8rkpgjsy5hngy'

const factories = {
  somnia: {
    chain_uid: "somnia",
    factory_address: "0x6af1dA89AF69E8454C77363D31475cf60FC00cfF"
  },
  polygon: {
    chain_uid: "polygon",
    factory_address: "0x08E6604931E9c2a978D4861b912f7894CC6063F7"
  },
  '0g': {
    chain_uid: "0g",
    factory_address: "0x08E6604931E9c2a978D4861b912f7894CC6063F7"
  },
  monad: {
    chain_uid: "monad",
    factory_address: "0x08E6604931E9c2a978D4861b912f7894CC6063F7"
  },
  bsc: {
    chain_uid: "bsc",
    factory_address: "0x08E6604931E9c2a978D4861b912f7894CC6063F7"
  },
  base: {
    chain_uid: "base",
    factory_address: "0x08e6604931e9c2a978d4861b912f7894cc6063f7"
  },
  optimism: {
    chain_uid: "optimism",
    factory_address: "0x08e6604931e9c2a978d4861b912f7894cc6063f7"
  },
  arbitrum: {
    chain_uid: "arbitrum",
    factory_address: "0x08e6604931e9c2a978d4861b912f7894cc6063f7"
  },
  ethereum: {
    chain_uid: "ethereum",
    factory_address: "0x08E6604931E9c2a978D4861b912f7894CC6063F7"
  },
  hyperliquid: {
    chain_uid: "hyperliquid",
    factory_address: "0x25bb0cb3b764b6457d5b21d2a28112add800c776"
  }
};
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

