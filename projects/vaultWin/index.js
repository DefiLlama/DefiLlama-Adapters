const { sumTokens2 } = require("../helper/unwrapLPs")

const abi = {
  "poolInfo": "function poolInfo(address) view returns (address token, address lendToken, uint256 roundStart, uint256 roundEnd, uint256 version, address yieldSource)"
}

async function tvl(api) {
  const lotteries = await api.call({ target: '0xE8aa1245E18185698f2af53D3ab4aC0f822120F8', abi: "address[]:getLotteries" })
  const poolInfos = await api.multiCall({ target: '0xE8aa1245E18185698f2af53D3ab4aC0f822120F8', abi: abi.poolInfo, calls: lotteries })
  const ownerTokens = poolInfos.map((data, i) => [[data.token, data.lendToken], lotteries[i]])
  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology: 'Staked tokens are counted as TVL',
  ftn: { tvl },
};
