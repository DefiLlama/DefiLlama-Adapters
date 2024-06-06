const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { staking, } = require("../helper/staking.js");
const { pool2 } = require('../helper/pool2')
const contracts = require("./contracts.json");
const vectorContracts = require("./vectorContracts.json");
///Joe Info
const JoePoolsInfo = vectorContracts.JOE.pools;
///Vector Info
const masterchefAddress = vectorContracts.PROTOCOL.masterchief.address;
const LockerAddress = vectorContracts.locker.address;
const VectorPoolsInfo = vectorContracts.PROTOCOL.pools;
const VectorStakingPools = [
  VectorPoolsInfo.VTX,
  VectorPoolsInfo.XPTP,
  VectorPoolsInfo.ZJOE,
];
const VectorLPPools = [
  VectorPoolsInfo.AVAX_VTX,
  VectorPoolsInfo.PTP_XPTP,
  VectorPoolsInfo.JOE_ZJOE,
];
async function tvl(api) {
  const balancerPools = [
    '0x26fa40f1f29e3b495ec3c4c46b24df7EcDE796d9',
    '0x0708b37dD778E459bEAB114FDF1C431068888379',
    '0x9Bd09687Da5Ec6b50e8242E7cE3cc5C065FF07c9',
    '0x53149F25aF0D7D19c0c2D7389e1eC73A3e479c72',
  ]
  const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: balancerPools })
  const bals = await api.multiCall({ abi: 'uint256:totalDeposits', calls: balancerPools })
  api.addTokens(tokens, bals)

  //GET JOE BALANCES
  const receiptTokens = JoePoolsInfo.map((pool) => pool[1]);
  const receiptTokenUnderlyings = JoePoolsInfo.map((pool) => pool[0]);
  const receiptBalances = (await api.multiCall({ target: masterchefAddress, calls: receiptTokens, abi: "function getPoolInfo(address) view returns (uint256,uint256,uint256 balance,uint256)", })).map(i => i.balance)
  api.addTokens(receiptTokenUnderlyings, receiptBalances)
  await api.sumTokens({ owner: masterchefAddress, tokens: [...VectorStakingPools, ...VectorLPPools].map(i => i.token.address), blacklistedTokens: [vectorContracts.tokens.VTX.address, ...receiptTokens] })

  return unwrapLPsAuto({ api });
}

module.exports = {
  doublecounted: true,
  avax: {
    tvl,
    staking: staking([masterchefAddress, LockerAddress], vectorContracts.tokens.VTX.address,),
    pool2: pool2(contracts.contracts.masterchef, contracts.contracts.pool2,),
  },
};
// node test.js projects/vector/index.js
