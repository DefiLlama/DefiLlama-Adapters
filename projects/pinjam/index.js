const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { staking } = require("../helper/staking");

const stakingContract = "0x6413707acd0eF29E54e4f7eE931bb00575868eA4";
const PINKAV = "0xE5274E38E91b615D8822e8512a29A16FF1B9C4Af";
const config = {
  kava: { lendingPool: "0x11C3D91259b1c2Bd804344355C6A255001F7Ba1e", fromBlock: 5281411, },
};

async function getTokens(api) {
  const { lendingPool, fromBlock } = config[api.chain]
  const logs = await getLogs({
    api,
    target: lendingPool,
    topics: ['0x9f8f649e3f624ae845ed20c597f2841f852ba62903a53736c2b36d67869ca919'],
    fromBlock,
  })
  return logs.map(log => getAddress(log.topics[1]))
}

async function tvl(_, _b, _cb, { api, }) {
  const { lendingPool } = config[api.chain]
  const tokens = await getTokens(api)
  const bals = await api.multiCall({ abi: abi.getTotalLiquidity, calls: tokens, target: lendingPool })
  const borrows = await api.multiCall({ abi: abi.getTotalDebt, calls: tokens, target: lendingPool })
  api.addTokens(tokens, bals)
  api.addTokens(tokens, borrows.map(i => i * -1))
}

async function borrowed(_, _b, _cb, { api, }) {
  const { lendingPool } = config[api.chain]
  const tokens = await getTokens(api)
  const bals = await api.multiCall({ abi: abi.getTotalDebt, calls: tokens, target: lendingPool })
  api.addTokens(tokens, bals)
}

module.exports = {
  methodology:
    "Counts the total tokens supplied to the lending pool and the total tokens borrowed from the lending pool.",
  kava: {
    staking: staking(stakingContract, PINKAV),
  },
  hallmarks: [
    [1688670115, "Multichain Exploit"],
],
};


Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    ...(module.exports[chain] || {}),
    tvl, borrowed,
  }
})

const abi = {
  "getSupportedAsset": "function getSupportedAsset(uint256 _index) view returns (address)",
  "getTotalDebt": "function getTotalDebt(address _underlyingAsset) view returns (uint256)",
  "getTotalLiquidity": "function getTotalLiquidity(address _underlyingAsset) view returns (uint256)",
}
