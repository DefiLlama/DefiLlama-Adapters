const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require('../helper/unwrapLPs');

module.exports = {
  tvlV1Eth,
  tvlV1Bsc
}

async function tvlV1Eth(api) {
  return tvlV1(api, "https://homora.alphafinance.io/static/contracts.json")
}

const wBNB = ADDRESSES.bsc.WBNB
async function tvlV1Bsc(api) {
  await tvlV1(api, "https://homora-bsc.alphafinance.io/static/contracts.json")
}

async function tvlV1(api, contractsUrl) {
  const data = await getConfig('alpha-hormora/v1/' + api.chain, contractsUrl);

  const bankAddress = data.bankAddress

  let pools = data.pools.map(i => i.goblinAddress)
  const tokens = await api.multiCall({  abi: 'address:lpToken', calls: pools })
  const shares = await api.multiCall({  abi: 'uint256:totalShare', calls: pools })
  const bals = await api.multiCall({  abi: 'function shareToBalance(uint256) view returns (uint256)', calls: shares.map((v, i) => ({ target: pools[i], params: v})) })
  api.add(tokens, bals)
  const totalEthMethodName = api.chain === 'bsc' ? 'totalBNB' : 'totalETH';
  const totalETH = await api.call({ target: bankAddress, abi: 'uint256:' + totalEthMethodName, });
  const totalDebt = await api.call({ target: bankAddress, abi: abi.glbDebtVal, });
  api.addGasToken(totalETH - totalDebt);
  return sumTokens2({ api, resolveLP: true})
}