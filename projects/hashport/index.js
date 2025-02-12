const { sumTokens2 } = require("../helper/unwrapLPs");
const { get } = require('../helper/http');
const { log } = require("@defillama/sdk");

const HEDERA_MIRROR_NODE_URL = 'https://mainnet-public.mirrornode.hedera.com'

const CONFIG = {
  ethereum: "0x367e59b559283C8506207d75B0c5D8C66c4Cd4B7",
  polygon: "0xf4C0153A8bdB3dfe8D135cE3bE0D45e14e5Ce53D",
  bsc: "0x9021926Be887355B76e60F4148eBB6b3f1fFAfCc",
  avax: "0xd8df34A071179fe8CEF910Ae0B43cdE49D611B49",
  optimism: "0x6Da4e99b62B8D910e1688E34121CD8D50B7c0C3e",
  arbitrum: "0x984BB007b41a865bd8a9Db9CA919000FBab5893a",
  fantom: "0x475B21ADe54B9494D8201e0330cA7994081f4E0F",
  moonbeam: "0x617D29b4bae43b3AA3D63b7f61177600036d2F6b",
  base: "0x0f3414b61B902513e04E76cA4d1a7B003D09F54b",
  cronos: "0x36DAaFd7C305677905A643CF1a0c74a281c6413c",
  aurora: "0x3b32202A662353DCb4DbB983aDBdF2AB49181506",
  hedera: '0.0.540219',
}

const hederaTokens = {}

const hederaTVL = async (address, paginationPath = '') => {
  try {
    let path = `/api/v1/accounts/${address}/tokens?limit=100&order=desc`
    if (paginationPath) {
      path = paginationPath
    }
    const { tokens, links } = await get(`${HEDERA_MIRROR_NODE_URL}${path}`)
    tokens.forEach(token => {
      hederaTokens[`hedera:${token.token_id}`] = String(token.balance)
    })
    if (links?.next) {
      return hederaTVL(address, links.next)
    }
  } catch (error) {
    log(error)
  }
  return hederaTokens
}

const evmTVL = async (api, token, useCoValent = true) => {
  const totalBalances = await sumTokens2({ api, owner: token, fetchCoValentTokens: useCoValent })
  return totalBalances
}

Object.entries(CONFIG).forEach(([chain, address]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      if (chain === 'hedera') {
        return hederaTVL(address)
      }
      if (chain == 'cronos' || chain == 'aurora') return evmTVL(api, address, false)
      return evmTVL(api, address);
    }
  };
});
