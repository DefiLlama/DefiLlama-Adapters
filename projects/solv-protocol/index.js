const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");

// token list
const tokenListsApiEndpoint = "https://token-list.solv.finance/vouchers-prod.json"


async function tvl() {
  const { api } = arguments[3]
  const chainId = api.getChainId()
  const tokens = await tokenList(chainId);
  await sumTokens2({ api, tokensAndOwners: tokens.map(i => [i.address, i.pool]), permitFailure: true })
}

async function tokenList(chainId) {
  let tokens = [];
  const allTokens = (await getConfig('solv-protocol', tokenListsApiEndpoint)).tokens;
  for (let token of allTokens) {
    if (chainId == token.chainId) {
      if (token.extensions.voucher.underlyingToken != undefined) {
        if (token.extensions.voucher.underlyingToken.symbol != "SOLV" && token.extensions.voucher.underlyingToken.symbol.indexOf("_") == -1) {
          tokens.push({
            address: token.extensions.voucher.underlyingToken.address,
            pool: token.extensions.voucher.vestingPool
          })
        }
      }
    }
  }

  return tokens;
}

['ethereum', 'bsc', 'polygon', 'arbitrum'].forEach(chain => {
  module.exports[chain] = { tvl }
})