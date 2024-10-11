const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const blacklistedTokens = ["0x0B048D6e01a6b9002C291060bF2179938fd8264c"];

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on all the Vaults through YieldWolf Contracts",
}

const config = {
  polygon: '0xBF65023BcF48Ad0ab5537Ea39C9242de499386c9',
  fantom: '0x876F890135091381c23Be437fA1cec2251B7c117',
  celo: '0xd54AA6fEeCc289DeceD6cd0fDC54f78079495E79',
  avax: '0xc9070B3EFE0aacC5AfB4B31C5DbDCA7C6B4bAAA9',
  cronos: '0x8fEc7A778Cba11a98f783Ebe9826bEc3b5E67F95',
  harmony: '0x8fec7a778cba11a98f783ebe9826bec3b5e67f95',
  bsc: '0xD3aB90CE1eEcf9ab3cBAE16A00acfbace30EbD75',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const poolInfos = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: config[chain]})
      const strategies = poolInfos.map(i => i.strategy)
      const tokens = poolInfos.map(i => i.stakeToken)
      const bals = await api.multiCall({  abi: abi.totalStakeTokens, calls: strategies})
      api.add(tokens, bals)
      blacklistedTokens.forEach(token => api.removeTokenBalance(token))
      return sumTokens2({ api, resolveLP: true })
    }
  }
})