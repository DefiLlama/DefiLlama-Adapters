const { sumTokens2 } = require('../helper/unwrapLPs');
const { covalentGetTokens } = require("../helper/http");

const vault = "0xAaAaAAAaA24eEeb8d57D431224f73832bC34f688"

module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      const tokens = await covalentGetTokens(vault, api.chain)
      return sumTokens2({  api, owner: vault, tokens, })
    },
  }
}