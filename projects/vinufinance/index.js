const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const CONTROLLER = '0x17bA239f2815BA01152522521737275a2439216f'
const EXECUTED_EVENT_ABI = 'event Executed(uint256 indexed proposalIdx, uint256 totalVotes, uint256 voteTokenTotalSupply)'
const GET_PROPOSAL_ABI = 'function getProposal(uint256 _proposalIdx) view returns (address _target, uint256 _action, uint256 _totalVotes, address _vetoApprover, bool _executed, uint256 _deadline)'
const POOL_WHITELISTED_ABI = 'function poolWhitelisted(address) view returns (bool)'
const GET_POOL_INFO_ABI = 'function getPoolInfo() external view returns (address _loanCcyToken, address _collCcyToken, uint256 _maxLoanPerColl, uint256 _minLoan, uint256 _loanTenor, uint256 _totalLiquidity, uint256 _totalLpShares, uint96 _rewardCoefficient, uint256 _loanIdx)'

async function tvl(api) {
  // Retrieve whitelisted pools by getting whitelist proposal logs and checking if the target pool is whitelisted
  const executedLogs = await getLogs2({ api, target: CONTROLLER, eventAbi: EXECUTED_EVENT_ABI, fromBlock: 1, })
  const proposals = await api.multiCall({ target: CONTROLLER, abi: GET_PROPOSAL_ABI, calls: executedLogs.map(l => l.proposalIdx.toString()) })
  const potentialPools = proposals.map(p => p._target)
  const isWhitelisted = await api.multiCall({ target: CONTROLLER, abi: POOL_WHITELISTED_ABI, calls: potentialPools })
  const whitelistedPools = potentialPools.filter((_, idx) => isWhitelisted[idx])

  // Retrieve pool info for whitelisted pools
  const poolInfos = await api.multiCall({ abi: GET_POOL_INFO_ABI, calls: whitelistedPools })
  const ownerTokens = poolInfos.map((pool, idx) => [[pool._loanCcyToken, pool._collCcyToken], whitelistedPools[idx]])

  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  vinu: {
    tvl
  }
}