const { getTokenSupplies } = require("../helper/solana")

const GOLD = "GoLDppdjB1vDTPSGxyMJFqdnj134yH6Prg9eqsGDiw6A"

module.exports = {
  methodology: 'The TVL corresponds to the amount of Gold tokens minted',
  solana: { tvl: async (api) => getTokenSupplies([GOLD], { api }) }
}