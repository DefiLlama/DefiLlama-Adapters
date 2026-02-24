const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require("../helper/cache/getLogs");

const CONFIG = {
  ESCROW_FACTORY: "0x11c6bb595824014e1c11c6b4a6ad2095cf7d22ab",
  AGENT_REGISTRY: "0xb528f6ba2d75c383dfe6cdab9957a6cd6b45d90d",
  TREASURY: "0xcF3f26F73AEc469dfc5a0940b157214fD730B0FB",
  ZEN: '0x5e7a494312d1943aa01682059df1c0d2f3a27c32',
  FROM_BLOCK: 24426849 // Deployment block
}

const ESCROW_CREATED_EVENT = "event EscrowCreated(address indexed escrow, address indexed buyer, address indexed seller, address agent, address token, uint256 amount, uint256 creationFee, uint256 version)";
const GET_AGENT_INFO = "function getAgentInfo(address agent) view returns (tuple(bool isActive, bool isAvailable, address stablecoinToken, uint8 stablecoinDecimals, uint256 stablecoinStake, uint256 normalizedStakeWad, uint256 daoTokenStake, uint256 disputeFeeBps, uint256 assignmentFeeBps, string description, string contact, uint256 lastEngagementTimestamp, uint256 totalResolved, uint256 registrationTime, uint256 activeCases) info)"

const tvl = async (api) => {
  const { ESCROW_FACTORY, FROM_BLOCK } = CONFIG
  const logs = await getLogs2({ api, target: ESCROW_FACTORY, eventAbi: ESCROW_CREATED_EVENT, fromBlock: FROM_BLOCK, onlyArgs: true });
  const escrowAddresses = logs.map((log) => log.escrow)
  const tokens = await api.multiCall({ calls: escrowAddresses, abi: 'address:token' })
  const tokensAndOwners = tokens.map((t, i) => [t, escrowAddresses[i]])
  return sumTokens2({ api, tokensAndOwners }) 
}

const staking = async (api) => {
  const { AGENT_REGISTRY, ZEN } = CONFIG
  const agentLists = await api.call({ target: AGENT_REGISTRY, abi: 'address[]:getAgentList' })
  const agentInfos = await api.multiCall({ target: AGENT_REGISTRY, calls: agentLists, abi: GET_AGENT_INFO })
  agentInfos.forEach(({ stablecoinToken , stablecoinStake, daoTokenStake }) => {
    api.add(stablecoinToken, stablecoinStake)
    api.add(ZEN, daoTokenStake)
  })
}

module.exports = {
  methodology: "TVL counts funds locked in active escrow contracts. Staking represents agent stakes in the AgentRegistry (reported separately). Treasury holdings are protocol-owned and excluded from TVL.",
  start: "2026-02-10",
  ethereum: { tvl, staking }
}