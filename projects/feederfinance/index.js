const { yieldHelper } = require('../helper/yieldHelper')
const { pool2 } = require('../helper/pool2')
const { staking } = require('../helper/staking')

const abis = {
  poolLength: "uint256:vaultsLength",
  poolInfo: {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"vaultInfo","outputs":[{"internalType":"address","name":"vault","type":"address"},{"internalType":"uint256","name":"blockNumber","type":"uint256"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"stateMutability":"view","type":"function"},
  wantLockedTotal: "uint256:tokenBalance",
  want: "address:want",
}

const getPoolIds = i => i.vault

async function getTokens({ api, poolInfos, }) {
  const poolIds = poolInfos.map(getPoolIds)
  return api.multiCall({
    abi: abis.want,
    calls: poolIds,
  })
}

module.exports = yieldHelper({
  project: 'feeder-finance',
  chain: 'fantom',
  masterchef: '0x9962a5d77159ab474a3fce3d0534be7dde143d26',
  nativeToken: '0x5d5530eb3147152fe78d5c4bfeede054c8d1442a',
  abis,
  poolFilter: i => i,
  getTokens,
  getPoolIds,
})

module.exports = {
  bsc: {
    tvl:() => ({}),
    pool2: pool2('0xd90A8878a2277879600AA2cba0CADC7E1a11354D', '0xcF3ED0670C671034C58F6b771757a8529238CA3a'),
    staking: staking('0xeb9902a19fa1286c8832bf44e9b18e89f682f614', '0x67d66e8ec1fd25d98b3ccd3b19b7dc4b4b7fc493'),
  },
  fantom: module.exports.fantom
};
