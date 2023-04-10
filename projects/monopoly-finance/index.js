const { staking } = require("../helper/staking");
const abi = require("./abi.json");
const chef = "0xfBb572B2F67746fe3A0Cb7DbDeE6717581a790cc";
const mono = "0xbC0a588120AB8b913436D342a702C92611C9af6a".toLowerCase();
const ACC_MONO_PRECISION = 1e18;

const bentoPools = [
  "0x79bf7147eBCd0d55e83Cb42ed3Ba1bB2Bb23eF20".toLowerCase(),
  "0x6DBE389142E40b01aA10Fb069ae448Fc4460DaE4".toLowerCase(),
];

async function getTokensInMasterChef(time, ethBlock, chainBlocks, { api }) {
  const poolInfo = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: chef })

  const [bentoLpTotalSupply, bentoLpReserves, bentoLpAssets] = await Promise.all([
    api.multiCall({ calls: bentoPools, abi: abi.totalSupply, }),
    api.multiCall({ calls: bentoPools, abi: abi.getReserves, }),
    api.multiCall({ calls: bentoPools, abi: abi.getAssets, }),
  ])
  const lpTokens = bentoLpAssets.flat().map(i => i.toLowerCase())
  const lpDecimals = await api.multiCall({ abi: 'erc20:decimals', calls: lpTokens })

  const bentoLpData = bentoPools.map((lp, i) => {
    const supply = (bentoLpTotalSupply[i] / 1e18)
    let [token0, token1] = bentoLpAssets[i].map(i => i.toLowerCase())
    const token0Decimals = lpDecimals[lpTokens.indexOf(token0)]
    const token1Decimals = lpDecimals[lpTokens.indexOf(token1)]

    return {
      lp,
      lpPerToken0: bentoLpReserves[i]._reserve0 / (supply * 10 ** token0Decimals),
      lpPerToken1: bentoLpReserves[i]._reserve1 / (supply * 10 ** token1Decimals),
      token0, token1, token0Decimals, token1Decimals,
    };
  })

  poolInfo.forEach(pool => {
    let { lpToken, totalShares, lpPerShare, } = pool
    lpToken = lpToken.toLowerCase()
    if (lpToken === mono) {
      return;
    }
    let bals = totalShares * lpPerShare / ACC_MONO_PRECISION
    if (bentoPools.includes(lpToken)) {
      const { token0, token1, lpPerToken0, lpPerToken1, token0Decimals, token1Decimals, } = bentoLpData.find(i => i.lp === lpToken)
      api.add(token0, bals * lpPerToken0 / (10 ** (18 - token0Decimals)))
      api.add(token1, bals * lpPerToken1 / (10 ** (18 - token1Decimals)))
    } else {
      api.add(lpToken, bals)
    }
  })
}
module.exports = {
  methodology: "TVL includes all farms in MasterChef contract, as well as staking pools.",
  arbitrum: {
    tvl: getTokensInMasterChef,
    staking: staking('0x7779b827832bBD9050917Ab29787B7DC3C3D5974', mono)
  },
};
