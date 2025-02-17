const { getLogs2 } = require('../helper/cache/getLogs');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getUniqueAddresses } = require('../helper/utils');

const STAKING_CONTRACT = '0x5cA4C88339D89B2547a001003Cca84F62F557A72';

const ABI = {
  "Stake": "event Stake(address indexed staker, address indexed token, uint256 amount)",
  "getTotalStake": "function getTotalStake(address token) view returns (uint256)",
}

function customCacheFunction({ cache, logs }) {
  if (!cache.logs) cache.logs = []
  cache.logs.push(...logs.map(i => i.token))
  cache.logs = getUniqueAddresses(cache.logs)
  return cache
}


async function staking(api) {
  const tokens = await getLogs2({ api, target: STAKING_CONTRACT, fromBlock: 20911530, customCacheFunction, eventAbi: ABI.Stake })
  const bals = await api.multiCall({ abi: ABI.getTotalStake, calls: tokens, target: STAKING_CONTRACT })
  api.add(tokens, bals)
  return sumTokens2({ api })
}

module.exports = {
  methodology: 'Accounts for all ERC20 tokens staked on the PEPPER staking contract.',
  chz: {
    tvl: () => ({}), staking,
  }
};
