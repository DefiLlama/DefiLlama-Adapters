const ADDRESSES = require("../helper/coreAssets.json");
const { staking } = require('../helper/staking')

const MUKGL_ADDRESS = "0x5eaAe8435B178d4677904430BAc5079e73aFa56e";
const MULAY_ADDRESS = "0xDDF2ad1d9bFA208228166311FC22e76Ea7a4C44D";
const MUU_TOKEN = "0xc5BcAC31cf55806646017395AD119aF2441Aee37";
const MUUU_REWARDS_ADDRESS = "0xB2ae0CF4819f2BE89574D3dc46D481cf80C7a255";
const BOOSTER_ADDRESS = "0x6d12e3dE6dAcDBa2779C4947c0F718E13b78cfF4";

const poolInfoAbi = "function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)"

// muuu is a Convex-style protocol on top of Kagla (a Curve fork on Astar). Users deposit
// Kagla LP tokens; muuu deposits them into Kagla gauges via the booster. TVL = the value
// of the Kagla LP underlyings that muuu controls.
//
// The booster (poolLength / poolInfo) is a standard contract and still works, but the
// Kagla registry (get_pool_from_lp_token / get_coins / get_balances) is a legacy Vyper
// contract whose calls now revert on current Astar state after a network runtime upgrade.
// So instead of decomposing each LP via the registry, we value muuu's position by its
// pro-rata share of each Kagla pool's reserves:
//   muuu LP balance / LP totalSupply * (each underlying coin held by the pool)
// using only standard ERC20 balanceOf / totalSupply calls.
//
// NOTE: this currently under-reports (only the LP->pool pairs mapped below are valued);
// it is kept deliberately as a non-erroring approximation rather than the previously
// broken registry-driven adapter.
//
// lptoken -> { pool, coins } snapshotted from the Kagla registry at an earlier block.
const lpToPool = {
  '0x18bdb86e835e9952cfaa844eb923e470e832ad58': { pool: ADDRESSES.oasis.ceUSDT, coins: [ADDRESSES.moonbeam.USDC, '0x3795c36e7d12a8c252a20c5a7b455f7c57b60283', '0x6de33698e9e9b787e09d3bd7771ef63557e148bb'] },
  '0xe12332a6118832cbafc1913ec5d8c3a05e6fd880': { pool: '0xe12332a6118832cbafc1913ec5d8c3a05e6fd880', coins: ['0xffffffff00000000000000010000000000000001', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'] },
  '0xdc1c5babb4dad3117fd46d542f3b356d171417fa': { pool: '0xdc1c5babb4dad3117fd46d542f3b356d171417fa', coins: ['0xffffffff000000000000000000000001000007c0', '0x18bdb86e835e9952cfaa844eb923e470e832ad58'] },
  '0xb91e7abcbf38d0cac1f99b062b75ae0c18e169d1': { pool: '0x578aa1be6d258677e80c9067711861dd981a663e', coins: ['0x257f1a047948f73158dadd03eb84b34498bcdc60', '0x5eaae8435b178d4677904430bac5079e73afa56e'] },
  '0x5c71534db6e54322943ad429209d97fa25bbfcd2': { pool: '0x4fd9011f0867e7e8af7608ad1bb969da8b0aba9b', coins: ['0xc4335b1b76fa6d52877b3046eca68f6e708a27dd', '0xddf2ad1d9bfa208228166311fc22e76ea7a4c44d'] },
}

// Kagla base-pool LP token that nests inside metapools; never counted as a raw asset.
const NESTED_LP = '0x18bdb86e835e9952cfaa844eb923e470e832ad58'

async function tvl(api) {
  // veKGL / veLAY locked through muuu (muKGL / muLAY are minted 1:1).
  const [veKGL, veLAY] = await api.multiCall({ abi: 'erc20:totalSupply', calls: [MUKGL_ADDRESS, MULAY_ADDRESS] })
  api.add(ADDRESSES.astar.KGL, veKGL)
  api.add(ADDRESSES.astar.LAY, veLAY)

  const pools = await api.fetchList({ lengthAbi: 'uint256:poolLength', itemAbi: poolInfoAbi, target: BOOSTER_ADDRESS })
  const active = pools.filter(p => !p.shutdown)

  // muuu's controlled LP balance is held by each pool's gauge.
  const lpBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: active.map(p => ({ target: p.lptoken, params: p.gauge })),
    permitFailure: true,
  })
  const lpSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: active.map(p => p.lptoken), permitFailure: true })

  for (let i = 0; i < active.length; i++) {
    const lp = active[i].lptoken.toLowerCase()
    const bal = lpBalances[i]
    const supply = lpSupplies[i]
    if (!bal || !supply || supply === '0') continue
    const mapping = lpToPool[lp]
    if (!mapping) {
      // Unknown LP: count muuu's LP balance directly (priced as the LP token).
      api.add(active[i].lptoken, bal)
      continue
    }
    const coins = mapping.coins.filter(c => c.toLowerCase() !== NESTED_LP)
    const reserves = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: coins.map(c => ({ target: c, params: mapping.pool })),
      permitFailure: true,
    })
    const ratio = Number(bal) / Number(supply)
    coins.forEach((c, j) => {
      if (reserves[j]) api.add(c, Number(reserves[j]) * ratio)
    })
  }
}

module.exports = {
  tvl,
  staking: staking(MUUU_REWARDS_ADDRESS, MUU_TOKEN),
};
