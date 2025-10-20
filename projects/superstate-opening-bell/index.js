const { getTokenSupplies } = require("../helper/solana")

const TOKENIZED_EQUITIES = [
    "2HehXG149TXuVptQhbiWAWDjbbuCsXSAtLTB5wc2aajK" //Galaxy Digital
]

module.exports = {
    methodology: 'The TVL corresponds to all the tokenized equities issued on-chain by superstate opening bell',
    solana: { tvl: async (api) => getTokenSupplies(TOKENIZED_EQUITIES, { api }) }
}
