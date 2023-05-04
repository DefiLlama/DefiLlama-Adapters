
const sdk = require('@defillama/sdk')

const http = require('../http')
const env = require('../env')
const { transformBalances } = require('../portedTokens')
const { log, getUniqueAddresses } = require('../utils')

const coreTokens = []

const endpoint = env.SUI_RPC || "https://fullnode.mainnet.sui.io/"


module.exports = {
  endpoint,
};
