const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: async (api) => {
<<<<<<< HEAD
      const nodeDaoView = '0xd7C049CD4ba216679ecC04Eb2767cC5E39812121'
      const totalEth = await api.call({ abi: 'uint256:getTotalTVL', target: nodeDaoView })
=======
      // nodeDAO liquidStaking neth tvl
      const nodeDaoLiquidStaking = '0x8103151E2377e78C04a3d2564e20542680ed3096'
      const nethTVL = await api.call({ abi: 'uint256:getTotalEthValue', target: nodeDaoLiquidStaking })

      // nodeDAO largeStaking tvl
      let largeStakingTVL = 0
      const nodeDaoLargeStaking = '0xBBd19e8F766Dcc94D50e47502b79C81cdaD484B8'
      const nodeOperatorRegistry = '0x8742178Ac172eC7235E54808d5F327C30A51c492'
      const operatorNumbers = await api.call({ abi: 'uint256:getNodeOperatorsCount', target: nodeOperatorRegistry })
      for (let i = 1; i <= operatorNumbers; i++) {
        const validatorNumbers = await api.call({ abi: 'function getOperatorValidatorCounts(uint256 _operatorId) external view returns (uint256)', target: nodeDaoLargeStaking, params: [i] })
        largeStakingTVL += parseInt(validatorNumbers) * 32_000_000_000_000_000_000
      }

      // nodeDAO totalEth = nethTVL + largeStakingTVL
      const totalEth = parseInt(nethTVL) + largeStakingTVL

>>>>>>> 182db35ed5d90c58bd7ffa173e7bed34fa229528
      api.add(nullAddress, totalEth)
    }
  }
}