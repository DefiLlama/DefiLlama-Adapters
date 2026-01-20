const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const owner = '0x34AA5631BdAD51583845e5e82e2CAf6cE63bA64D'

const abis = {
  conditionCollateral: "function conditionCollateral(bytes32) view returns (address)",
}

const eventAbis = {
  conditionPreparation: "event ConditionPreparation(bytes32 indexed conditionId, address indexed oracle, bytes32 indexed questionId, uint256 outcomeSlotCount)",
}

const tvl = async (api) => {
  const positionsLogs = await getLogs2({ api, target: owner, eventAbi: eventAbis.conditionPreparation, fromBlock: 23899060, toBlock: await api.getBlock() - 100, onlyArgs: true })
  const conditionIds = positionsLogs.filter(log => log[1].toLowerCase() !== ADDRESSES.null).map(log => log[0]);
  const collTokens = await api.multiCall({ calls: conditionIds.map((id) => ({ target: owner, params: [id] })), abi: abis.conditionCollateral })
  const uniqueCollTokens = [...new Set(collTokens.map(addr => addr.toLowerCase()))];
  return api.sumTokens({ owner, tokens: uniqueCollTokens })
}

module.exports = {
  methodology: 'TVL (Total Value Locked) refers to the total value of all collateral tokens held in the Conditional Token smart contract, including all collateral tokens provided to O.LAB Prediction markets across different chains.',
  start: 23899060,
  deadFrom: 1752422400,
  base: { tvl }
}