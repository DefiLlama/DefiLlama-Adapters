const ADDRESSES = require('../helper/coreAssets.json')

const ETH = ADDRESSES.null
const RPL = '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'
const rocketMinipoolManager = '0xe54B8C641fd96dE5D6747f47C19964c6b824D62C'
const rocketMegapoolManager = '0xf2CCd522Ba5fFEda28fe0389963845D61F342034'
const trustedNodeManager = '0xb8e783882b11Ff4f6Cef3C501EA0f4b960152cc9'
const rocketVault = '0x3bDC69C4E5e13E52A65f5583c23EFB9636b469d6'

const abi = {
  getValidatorCount: "function getValidatorCount() view returns (uint256)",
  getActiveMinipoolCount: "function getActiveMinipoolCount() view returns (uint256)",
  getMemberCount: "function getMemberCount() view returns (uint256)",
  getMemberRPLBondAmount: "function getMemberRPLBondAmount(address _nodeAddress) view returns (uint256)",
  getMemberAt: "function getMemberAt(uint256 _index) view returns (address)",
}

const tvl = async (api) => {
  const megapoolCount = await api.call({ target: rocketMegapoolManager, abi: abi.getValidatorCount })
  const activeMinipoolCount = await api.call({ target: rocketMinipoolManager, abi: abi.getActiveMinipoolCount })
  api.add(ETH, (Number(megapoolCount) + Number(activeMinipoolCount)) * 32 * 1e18)
}

const staking = async (api) => {
  const trustedNodes = await api.fetchList({ target: trustedNodeManager, lengthAbi: abi.getMemberCount, itemAbi: abi.getMemberAt  })
  api.add(RPL, await api.multiCall({ calls: trustedNodes.map((node) => ({ target: trustedNodeManager, params: [node] })), abi: abi.getMemberRPLBondAmount }))
  return api.sumTokens({ owner: rocketVault, tokens: [RPL] })
}

module.exports = {
  methodology: 'TVL represents the total ETH from the minipools',
  ethereum: { tvl, staking }
}