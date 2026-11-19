const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

const FACTORY = '0xbFA531C90FD9e42aC13Af14823B30e40761dd3A2'
const HOOK = '0x8bb4516059F9149Bc3b89018Fc7537f1F14a30cc'
const STATE_VIEW = '0x76fd297e2d437cd7f76d50f01afe6160f86e9990'
const slot0Abi = 'function getSlot0(bytes32) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)'

async function tvl(api) {
  const usdg = await api.call({ abi: 'address:usdg', target: FACTORY })
  const stocks = await api.fetchList({ lengthAbi: 'stockCount', itemAbi: 'allStocks', target: FACTORY })
  const vaults = (await api.multiCall({ abi: 'function vaultOf(address) view returns (address)', target: FACTORY, calls: stocks })).filter(v => v !== nullAddress)

  const poolIds = await api.multiCall({ abi: 'bytes32:poolId', calls: vaults })
  const token0s = await api.multiCall({ abi: 'address:currency0', calls: vaults })
  const token1s = await api.multiCall({ abi: 'address:currency1', calls: vaults })
  const tickLowers = await api.multiCall({ abi: 'int24:tickLower', calls: vaults })
  const tickUppers = await api.multiCall({ abi: 'int24:tickUpper', calls: vaults })
  const liquidities = await api.multiCall({ abi: 'uint128:positionLiquidity', calls: vaults })
  const slot0s = await api.multiCall({ abi: slot0Abi, target: STATE_VIEW, calls: poolIds })
  // unharvested LP fees the hook holds for each vault
  const lpPots = await api.multiCall({ abi: 'function lpPot(bytes32) view returns (uint256)', target: HOOK, calls: poolIds })

  vaults.forEach((_, i) => {
    addUniV3LikePosition({ api, token0: token0s[i], token1: token1s[i], liquidity: +liquidities[i], tickLower: +tickLowers[i], tickUpper: +tickUppers[i], tick: +slot0s[i].tick })
    api.add(usdg, lpPots[i])
  })
  // idle stock and harvested LP fees (USDG) held by the vaults
  return api.sumTokens({ owners: vaults, tokens: [usdg, ...stocks] })
}

module.exports = {
  doublecounted: true,
  methodology:
    'Tracks the underlying Uniswap V4 LP positions, vault-held idle balances and harvested LP fee entitlements, plus hook-held unharvested LP fee entitlements (lpPot) across all active Quotrons stock LP vaults on Ink.',
  ink: {
    tvl,
  },
}
