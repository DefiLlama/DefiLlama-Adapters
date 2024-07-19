const { staking } = require('./helper/staking')
const { sumUnknownTokens } = require('./helper/unknownTokens')

const abi = {
  "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accZooPerShare, bool emergencyMode)",
  "poolLength": "uint256:poolLength",
}

async function tvl(api) {
  const masterchef = '0x1aC6332f1f1892B49Fb26aD1934F74F4Cd8C9dB9'
  await addMasterchef(masterchef, api)
}


async function wanTvl(api) {
  const masterchef = '0x4E4Cb1b0b4953EA657EAF29198eD79C22d1a74A2'
  await addMasterchef(masterchef, api)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true })
}

async function addMasterchef(masterchef, api) {
  const infos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: masterchef })
  const tokens = infos.map(i => i.lpToken)
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(i => ({ target: i, params: masterchef })) })
  api.addTokens(tokens, bals)
}


module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  timetravel: false,
  avax: {
    tvl: () => ({}),
    pool2: tvl,
    staking: staking(['0xcf066a3b365791432c9ecfec6eded67c72fd69c6', '0x64E785488e99e2faDE189CdA585BAFE86248ad80'], '0x1B88D7aD51626044Ec62eF9803EA264DA4442F32')
  },
  wan: {
    tvl: () => ({}),
    pool2: wanTvl,
    staking: staking(['0x23A9f34aa1e45f9E191A6615d24A781607a1bcb1', '0xBCE166860F514b6134AbC6E9Aa0005CC489b6352', '0x180793667513140e223Df73650D8615C61f93368'], '0x6e11655d6aB3781C6613db8CB1Bc3deE9a7e111F')
  },
}
