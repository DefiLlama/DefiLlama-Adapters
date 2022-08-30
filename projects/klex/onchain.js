const sdk = require('@defillama/sdk');

const { request, gql } = require("graphql-request");
const { transformArbitrumAddress } = require('../helper/portedTokens')
const { requery } = require('../helper/requery')

const abi = require('./abi');
const ignored = []

const V2_ADDRESS = '0xb519Cf56C63F013B0320E89e1004A8DE8139dA27'; // shared by all networks

function v2(chain) {
  return async (time, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain]
    const balances = {}
    const tokensApi = `https://graph-prod.klex.finance/subgraphs/name/klex-staging-2-mainnet`;
    const POOL_TOKENS = gql`
      {
        balancers {
          pools {
            tokens {
              address
            }
          }
        }
      }`;

    const v2Tokens = await request(tokensApi, POOL_TOKENS, {
      block,
    });
    let tokenAddresses = [];
    for (let i = 0; i < v2Tokens.balancers[0].pools.length; i++) {
      for (let address of v2Tokens.balancers[0].pools[i].tokens) {
        tokenAddresses.push(address.address)
      }
    }
    tokenAddresses = [...new Set(tokenAddresses)]

    let v2Calls = tokenAddresses.map((address) => {
      return {
        target: address,
        params: V2_ADDRESS
      }
    });
    let v2Balances = await sdk.api.abi.multiCall({
      block,
      calls: v2Calls,
      abi: 'erc20:balanceOf'
    });
    await requery(v2Balances, chain, block, "erc20:balanceOf")
    let transform = addr => `${chain}:${addr}`
    if(chain === "arbitrum"){
      transform = await transformArbitrumAddress()
    }
    sdk.util.sumMultiBalanceOf(balances, v2Balances, true, transform)

    return balances;
  }
}

module.exports = {
  klaytn:{
    tvl: v2("klaytn")
  },
}
