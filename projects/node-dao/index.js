const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      // nodeDAO v0 validator nft
      const nodeDaoV0ValidatorNFT = '0x40Cd77D9aa9e0b2D485259415eA05486B201c514'
      const v0VdalitorsNumber = await api.call({ abi: 'uint256:totalSupply', target: nodeDaoV0ValidatorNFT })

      // nodeDAO liquidStaking
      const nodeDaoLiquidStaking = '0x8103151E2377e78C04a3d2564e20542680ed3096'
      const nethTVL = await api.call({ abi: 'uint256:getTotalEthValue', target: nodeDaoLiquidStaking })

      // nodeDAO v1 validator nft
      const nodeDaoV1ValidatorNFT = '0x58553F5c5a6AEE89EaBFd42c231A18aB0872700d'
      const v1Vdalitors = await api.call({ abi: 'uint256[]:activeNftsOfUser', target: nodeDaoV1ValidatorNFT })

      // nodeDAO totalEth = nethTVL + (v1ValidatorNumber + v0VdalitorsNumber)* 32 eth
      let totalEth = parseInt(nethTVL) + (v1Vdalitors.length + parseInt(v0VdalitorsNumber)) * 32_000_000_000_000_000_000

      // nodeDAO largeStaking
      const nodeDaoLargeStaking = '0xBBd19e8F766Dcc94D50e47502b79C81cdaD484B8'
      const nodeOperatorRegistry = '0x8742178Ac172eC7235E54808d5F327C30A51c492'
      const operatorNumbers = await api.call({ abi: 'uint256:getNodeOperatorsCount', target: nodeOperatorRegistry })
      for (let i = 1; i <= operatorNumbers; i++) {
        const validatorNumbers = await api.call({ abi: 'function getOperatorValidatorCounts(uint256 _operatorId) external view returns (uint256)', target: nodeDaoLargeStaking, params: [i] })
        totalEth += parseInt(validatorNumbers) * 32_000_000_000_000_000_000
      }

      api.add(nullAddress, totalEth)
    }
  }
}
