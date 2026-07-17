const { sumTokens2 } = require('../helper/unwrapLPs')
const Staking = "0xF21469471b5b89762ec7F017cF9FB607B0E25Ee7";

const abis = {
  lpToken: 'function stakingToken(uint256) public view returns (address)',
  poolLength: 'function poolLength() public view returns (uint256)',
}

module.exports = {
  robinhood: {
    tvl: async (api) => {
      const vaults = await api.fetchList({ target: Staking, lengthAbi: abis.poolLength, itemAbi: abis.lpToken, })
      const tokens = await api.multiCall({ abi: 'address:want', calls: vaults })
      const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults })
      tokens.forEach((token, i) => {
        api.add(token, bals[i])
      })
      return sumTokens2({ api, resolveLP: true })
    }
  }
}
