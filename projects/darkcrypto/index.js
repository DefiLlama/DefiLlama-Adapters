const { stakingPriceLP } = require("../helper/staking");
const { sumUnknownTokens } = require('../helper/unknownTokens')
const abi = {
  "poolLength": "uint256:poolLength",
  "token0": "address:token0",
  "token1": "address:token1",
  "wantLockedTotal": "uint256:wantLockedTotal",
  "poolInfo": "function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, address strategy, uint256 earlyWithdrawFee, uint256 earlyWithdrawTime)"
};

const sky = "0x9D3BBb0e988D9Fb2d55d07Fe471Be2266AD9c81c";
const boardroom = "0x2e7d17ABCb9a2a40ec482B2ac9a9F811c12Bf630";
const masterChef = "0x42B652A523367e7407Fb4BF2fA1F430781e7db8C"

// ===== inlined from ./vault-utils =====
const VAULT_ADDR = "0x66D586eae9B30CD730155Cb7fb361e79D372eA2a"

const vaultLocked = async (api) => {
  const poolInfos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: VAULT_ADDR })
  let wanLockedTotals = await api.multiCall({ abi: abi.wantLockedTotal, calls: poolInfos.map(i => i.strategy), })
  const wants =  poolInfos.map(i => i.want)
  api.addTokens(wants, wanLockedTotals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true,})
};

// ===== inlined from ./farm-utils =====
const farmAbi = {
  getReserves: "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
  poolInfo: "function poolInfo(uint256) view returns (address token, uint256 allocPoint, uint256 lastRewardTime, uint256 accSkyPerShare, bool isStarted)"
}

const pool2Balances = async (api, masterChef) => {
  const calls = Array.from({ length: 9 }, (_, i) => ({ target: masterChef, params: [i] }));
  const poolsInfos = await api.multiCall({ calls, abi: farmAbi.poolInfo })
  const pools = poolsInfos.map(({ token }) => token)

  const [token0s, token1s, balances, reserves, supplies] = await Promise.all([
    api.multiCall({ calls: pools.map((p) => ({ target: p })), abi: 'address:token0', permitFailure: true }),
    api.multiCall({ calls: pools.map((p) => ({ target: p })), abi: 'address:token1', permitFailure: true }),
    api.multiCall({ calls: pools.map((p) => ({ target: p,  params: [masterChef] })), abi: 'erc20:balanceOf', permitFailure:true }),
    api.multiCall({ calls: pools.map((p) => ({ target: p })), abi: farmAbi.getReserves, permitFailure:true }),
    api.multiCall({ calls: pools.map((p) => ({ target: p })), abi: 'erc20:totalSupply', permitFailure:true })
  ])

  pools.forEach((_, i) => {
    const token0 = token0s[i]
    const token1 = token1s[i]
    const balance = balances[i]
    const reserve = reserves[i]
    const supply = supplies[i]
    if (!token0 || !token1 || !balance || !reserve || !supply) return

    const _balance0 = Math.round(reserve[0] * balance / supply)
    const _balance1 = Math.round(reserve[1] * balance / supply)

    api.add(token0, _balance0)
    api.add(token1, _balance1)
  })
}

async function vault(api){
  return vaultLocked(api)
}

module.exports = {
  doublecounted: true,
  cronos: {
    tvl:vault,
    pool2: (api) => pool2Balances(api, masterChef),
    staking: stakingPriceLP(
      boardroom,
      sky,
      "0xaA0845EE17e4f1D4F3A8c22cB1e8102baCf56a77"
    ),
  },
};
