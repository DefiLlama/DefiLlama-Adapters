const ADDRESSES = require('../helper/coreAssets.json')

const sdlToken = "0xA95C5ebB86E0dE73B4fB8c47A45B792CFeA28C23";
const sdlStakingPool = "0x0B2eF910ad0b34bf575Eb09d37fd7DA6c148CA4d";
const linkToken = ADDRESSES.ethereum.LINK;
const linkStakingPool = "0xb8b295df2cd735b15BE5Eb419517Aa626fc43cD5";
const linkPriorityPool = "0xDdC796a66E8b83d0BcCD97dF33A6CcFBA8fd60eA";

async function tvl(api) {
  const bals = await Promise.all([
    api.call({ target: linkStakingPool, abi: 'uint256:totalStaked', }),
    api.call({ target: linkPriorityPool, abi: 'uint256:totalQueued', }),
  ])
  bals.forEach(i => api.add(linkToken, i))
  return api.getBalances()
}

async function staking(api) {
  const bal = await api.call({  abi: 'uint256:totalStaked', target: sdlStakingPool})
  api.add(sdlToken, bal)
  return api.getBalances()
}

module.exports = {
      methodology:
    "Queries LINK staking/priority pools and SDL staking pool for the total amount of tokens staked",
  start: '2022-12-06',
  ethereum: {
    tvl,
    staking,
  },
};
