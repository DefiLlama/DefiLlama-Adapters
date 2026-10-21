const ADDRESSES = require('../helper/coreAssets.json')

// [underlying, StrategyManager, LayerZero OFT / OFTAdapter] per vault.
// Strategies are read from StrategyManager.getStrategies(), so new ones are picked up automatically.
// Every strategy is an ERC4626 whose shares are held by the StrategyManager.
const config = {
  base: [
    [ADDRESSES.base.USDC, '0xf7E745658fa6f1fe8f2CAb47861a273991Cd3374', '0xd7abc360dfcf1b6dd0a03138235e12a2bc1c1c8b'],
    [ADDRESSES.base.USDT, '0x075193D36693DA7BA3Bb709cF63bEf070BA04D94', '0x264d6474802ef8bc1bc05f89f7d640d1e93c5330'],
  ],
  ethereum: [
    [ADDRESSES.ethereum.USDC, '0xf7E745658fa6f1fe8f2CAb47861a273991Cd3374', '0xd58e8c1c83d598ad76b5f0e26b4a25cdb885d190'],
    [ADDRESSES.ethereum.USDT, '0x075193D36693DA7BA3Bb709cF63bEf070BA04D94', '0x2d342de4c58a871b3525740c58a1c112d5835865'],
  ],
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      for (const [token, sm] of config[chain]) {
        const strategies = await api.call({ abi: 'address[]:getStrategies', target: sm })
        const shares = await api.multiCall({ abi: 'erc20:balanceOf', calls: strategies.map(target => ({ target, params: [sm] })) })
        const assets = await api.multiCall({ abi: 'function convertToAssets(uint256) view returns (uint256)', calls: strategies.map((target, i) => ({ target, params: [shares[i]] })) })
        api.add(token, assets)
      }
      // Idle funds sitting in the StrategyManager and in the bridge contracts
      return api.sumTokens({ tokensAndOwners: config[chain].flatMap(([token, sm, oft]) => [[token, sm], [token, oft]]) })
    }
  }
})

module.exports.doublecounted = true
