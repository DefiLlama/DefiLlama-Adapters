const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  optimism: { factory: '0xbb505c54d71e9e599cb8435b4f0ceec05fc71cbd', fromBlock: 96265067, vaultFactory: '0x155620a2e6a9392c754b73296d9655061525729b', positionViewer: '0xf9cfb8a62f50e10adde5aa888b44cf01c5957055' },
  base: {factory: '0xbb505c54d71e9e599cb8435b4f0ceec05fc71cbd', fromBlock: 1960257, vaultFactory: '0x155620a2e6a9392c754b73296d9655061525729b', positionViewer: '0xf9cfb8a62f50e10adde5aa888b44cf01c5957055' },
  berachain: {factory: '0xBB505c54D71E9e599cB8435b4F0cEEc05fC71cbD', fromBlock: 2600000, vaultFactory: '0x155620a2e6a9392c754b73296d9655061525729b', positionViewer: '0xf9cfb8a62f50e10adde5aa888b44cf01c5957055' },
}

module.exports = {};

const getVaultAbi = "function getVault(uint256 vaultId) view returns (tuple(address gauge, address pair, address token0, address token1, bool stable, bool paused, bool frozen, bool borrowingEnabled, bool liquidateWithTWAP, uint16 maxLeverage, uint16 premiumMaxLeverage, uint16 maxPriceDiff, uint16 liquidateDebtRatio, uint16 withdrawFeeRate, uint16 compoundFeeRate, uint16 liquidateFeeRate, uint16 rangeStopFeeRate, uint16 protocolFeeRate, uint256 premiumRequirement, uint256 protocolFee0Accumulated, uint256 protocolFee1Accumulated, uint256 minInvestValue, uint256 minSwapAmount0, uint256 minSwapAmount1, uint256 totalLp, uint256 totalLpShares, uint256 premiumUtilizationOfReserve0, uint256 debtLimit0, uint256 debtPositionId0, uint256 debtTotalShares0, uint256 premiumUtilizationOfReserve1, uint256 debtLimit1, uint256 debtPositionId1, uint256 debtTotalShares1))"


Object.keys(config).forEach(chain => {
  const { factory, fromBlock, vaultFactory, positionViewer, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x857d20297bde4478f678d3aafbfdf7fbfc90a4200b62eb053a32b2c50335676f'],
        eventAbi: 'event InitReserve (address indexed reserve, address indexed eTokenAddress, address stakingAddress, uint256 id)',
        onlyArgs: true,
        fromBlock,
      })

      const vaultLogs = await getLogs({
        api,
        target: vaultFactory,
        topics: ['0xc0a8c0f282890a3da41a2183a1e9a1988888e8d8a0a39d933d42b0418e626250'],
        fromBlock,
      })

      const calls = []
      for (let i = 1; i <= vaultLogs.length; i++)  calls.push(i)

      const data = (await api.multiCall({ target: positionViewer, abi: getVaultAbi, calls, permitFailure: true })).filter(i => i)
      data.forEach(({ pair, totalLp }) => api.add(pair, totalLp))

      const tokensAndOwners = logs.map(i => [i.reserve, i.eTokenAddress])

      return sumTokens2({ api, tokensAndOwners, resolveLP: true, })
    }
  }
})