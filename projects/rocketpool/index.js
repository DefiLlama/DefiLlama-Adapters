const ADDRESSES = require('../helper/coreAssets.json')

const ETH = ADDRESSES.null
const RPL = '0xd33526068d116ce69f19a9ee46f0bd304f21a51f'
const rocketNodeManager = '0x2b52479F6ea009907e46fc43e91064D1b92Fdc86'
const rocketVault = '0x3bDC69C4E5e13E52A65f5583c23EFB9636b469d6'
const rocketRewardsPool = '0xEE4d2A71cF479e0D3d0c3c2C923dbfEB57E73111'
const trustedNodeManager = '0xb8e783882b11Ff4f6Cef3C501EA0f4b960152cc9'

const abi = {
  getNodeCount: "function getNodeCount() view returns (uint256)",
  getNodeAddresses: "function getNodeAddresses(uint256 _offset, uint256 _limit) view returns (address[])",
  getNodeDetails: "function getNodeDetails(address _nodeAddress) view returns ((bool exists, uint256 registrationTime, string timezoneLocation, bool feeDistributorInitialised, address feeDistributorAddress, uint256 rewardNetwork, uint256 rplStake, uint256 effectiveRPLStake, uint256 minimumRPLStake, uint256 maximumRPLStake, uint256 ethMatched, uint256 ethMatchedLimit, uint256 minipoolCount, uint256 balanceETH, uint256 balanceRETH, uint256 balanceRPL, uint256 balanceOldRPL, uint256 depositCreditBalance, uint256 distributorBalanceUserETH, uint256 distributorBalanceNodeETH, address withdrawalAddress, address pendingWithdrawalAddress, bool smoothingPoolRegistrationState, uint256 smoothingPoolRegistrationChanged, address nodeAddress))",
  getPendingETHRewards: "function getPendingETHRewards() view returns (uint256)",
  balanceOf: "function balanceOf(string _networkContractName) view returns (uint256)",
  balanceOfToken: "function balanceOfToken(string _networkContractName, address _tokenAddress) view returns (uint256)",
  getMemberAt: "function getMemberAt(uint256 _index) view returns (address)",
  getMemberCount: "function getMemberCount() view returns (uint256)",
  getMemberRPLBondAmount: "function getMemberRPLBondAmount(address _nodeAddress) view returns (uint256)"
};

const tvl = async (api) => {
  const [nodeLength, pendingETHRewards, depositPoolBalance] = await Promise.all([
    api.call({ target: rocketNodeManager, abi: abi.getNodeCount }),
    api.call({ target: rocketRewardsPool, abi: abi.getPendingETHRewards }),
    api.call({ target: rocketVault, abi: abi.balanceOf, params: ['rocketDepositPool'] }),
  ])

  const addresses = await api.call({ target: rocketNodeManager, abi: abi.getNodeAddresses, params: [0, nodeLength] });

  const batchSize = 100;
  const batchedAddresses = [];
  for (let i = 0; i < addresses.length; i += batchSize) {
    batchedAddresses.push(addresses.slice(i, i + batchSize));
  }

  const nodeDetails = await Promise.all(
    batchedAddresses.map(async (batch) => {
      const results = await api.multiCall({ calls: batch.map((address) => ({ target: rocketNodeManager, params: [address] })), abi: abi.getNodeDetails, permitFailure: true })
      return results ? results.filter((result) => result && result.exists) : []
    })
  )

  const { minipoolCount, ethMatched } = nodeDetails.flat().reduce(
    (acc, curr) => {
      if (!curr) return acc;
      acc.minipoolCount += Number(curr.minipoolCount) || 0;
      acc.ethMatched += Number(curr.ethMatched) || 0;
      return acc;
    },
    { minipoolCount: 0, ethMatched: 0 }
  );

  api.add(ETH, [pendingETHRewards, depositPoolBalance, ethMatched])
}

const staking = async (api) => {
  const trustedNodes = await api.fetchList({ target: trustedNodeManager, lengthAbi: abi.getMemberCount, itemAbi: abi.getMemberAt  })
  api.add(RPL, await api.multiCall({ calls: trustedNodes.map((node) => ({ target: trustedNodeManager, params: [node] })), abi: abi.getMemberRPLBondAmount }))
  return api.sumTokens({ owner: rocketVault, tokens: [RPL] })
}

module.exports = {
  methodology: 'TVL represents the total ETH from the minipools as well as the staking rewards pending distribution',
  ethereum: { tvl, staking }
}