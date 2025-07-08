const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const abiV3 = require("./abiV3.json");
const abiNew = require("./abiNew.json");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking.js");

// liquidity pools
async function tvl(api) {
  const poolInfo1 = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: '0x0ac58Fd25f334975b1B61732CF79564b6200A933' })
  const poolInfo2 = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: '0xB87F7016585510505478D1d160BDf76c1f41b53d' })
  const poolInfo3 = await api.fetchList({ lengthAbi: abiNew.poolLength, itemAbi: abiNew.poolInfo, target: '0x9EBce8B8d535247b2a0dfC0494Bc8aeEd7640cF9' })
  const poolInfo4 = await api.fetchList({ lengthAbi: abiV3.poolLength, itemAbi: abiV3.poolInfo, target: '0x405960AEAad7Ec8B419DEdb511dfe9D112dFc22d' })
  let allPoolInfos = poolInfo1.concat(poolInfo2).concat(poolInfo3).concat(poolInfo4);

  allPoolInfos = allPoolInfos.filter(el => el.want.toLowerCase() !== "0xC9440dEb2a607A6f6a744a9d142b16eD824A1A3b".toLowerCase() && el.strat.toLowerCase() !== ADDRESSES.null.toLowerCase())
  const tokens = allPoolInfos.map(i => i.want)
  const bals = (await api.multiCall({ abi: abi.wantLockedTotal, calls: allPoolInfos.map(i => i.strat), permitFailure: true })).map(i => i ?? 0)
  const _totalAmounts = await api.multiCall({ abi: abiV3.getTotalAmounts, calls: tokens, permitFailure: true })
  const totalAmounts = []
  const thetaTokens = []
  const thetaBals = []
  _totalAmounts.forEach((amounts, i) => {
    if (amounts) {
      totalAmounts.push(amounts)
      thetaTokens.push(tokens[i])
      thetaBals.push(bals[i])
    } else {
      api.add(tokens[i], bals[i])
    }
  })
  const supplies = await api.multiCall({ abi: abiV3.totalSupply, calls: thetaTokens })
  const token0s = await api.multiCall({ abi: abiV3.token0, calls: thetaTokens })
  const token1s = await api.multiCall({ abi: abiV3.token1, calls: thetaTokens })
  for (let i = 0; i < totalAmounts.length; i++) {
    const totalSupply = supplies[i]
    const token0 = token0s[i]
    const token1 = token1s[i]
    const vaultAmt = totalAmounts[i]
    const ratio = thetaBals[i] / totalSupply
    api.add(token0, ratio * vaultAmt.total0)
    api.add(token1, ratio * vaultAmt.total1)
  }

  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  doublecounted: true,
  bsc: {
    tvl,
    staking: staking("0x60A895073AdC0e5F5a22C60bdfc584D79B5219a1", "0xb3cb6d2f8f2fde203a022201c81a96c167607f15",)
  },
};
