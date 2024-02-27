const { staking } = require('../helper/staking')
const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "Calculates the total collateral value of all the Mint.club V2 Bonding Curve protocols.",
};

const V2_BOND_CONTRACTS = {
  avax: "0x3Fd5B4DcDa968C8e22898523f5343177F94ccfd1",
}

const ownTokens = {
  bsc: ['0x1f3Af095CDa17d63cad238358837321e95FC5915']
}

const chains = ['avax', 'ethereum', 'optimism', 'arbitrum', 'polygon', 'bsc', 'base']

chains.forEach(chain => {
  const BOND_CONTRACT = V2_BOND_CONTRACTS[chain] ?? '0xc5a076cad94176c2996B32d8466Be1cE757FAa27'
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const tokens = await api.fetchList({ lengthAbi: 'tokenCount', itemAbi: 'tokens', target: BOND_CONTRACT })
      const rTokens = (await api.multiCall({ calls: tokens, itemAbi: 'tokens', target: BOND_CONTRACT, abi: 'function tokenBond(address) view returns (address,  uint16, uint16,  uint40,  address reserveToken, uint256)' })).map(i => i.reserveToken)
      return sumTokens2({ api, owner: BOND_CONTRACT, tokens: rTokens, permitFailure: true, blacklistedTokens: ownTokens[chain] })
    }
  }
  if (ownTokens[chain]) module.exports[chain].staking = staking(BOND_CONTRACT, ownTokens[chain])
})