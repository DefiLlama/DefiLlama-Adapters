// AutoRange (uni-bot-agent) — non-custodial Uniswap V3 concentrated-liquidity
// vault platform. A `VaultFactory`/`VaultFactoryArb` deploys one EIP-1167
// clone per LP ("vault"); each vault holds idle token0/token1 plus, once
// active, a single Uniswap V3 NFT position. TVL sums both across every vault
// the factory has ever created.

const Q96 = 1n << 96n;
const MAX_UINT256 = (1n << 256n) - 1n;

// Port of Uniswap V3's TickMath.getSqrtRatioAtTick (core/libraries/TickMath.sol).
function getSqrtRatioAtTick(tick) {
  const absTick = tick < 0 ? BigInt(-tick) : BigInt(tick);
  let ratio =
    (absTick & 0x1n) !== 0n
      ? 0xfffcb933bd6fad37aa2d162d1a594001n
      : 0x100000000000000000000000000000000n;
  if ((absTick & 0x2n) !== 0n) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
  if ((absTick & 0x4n) !== 0n) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
  if ((absTick & 0x8n) !== 0n) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
  if ((absTick & 0x10n) !== 0n) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
  if ((absTick & 0x20n) !== 0n) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
  if ((absTick & 0x40n) !== 0n) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
  if ((absTick & 0x80n) !== 0n) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
  if ((absTick & 0x100n) !== 0n) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
  if ((absTick & 0x200n) !== 0n) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
  if ((absTick & 0x400n) !== 0n) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
  if ((absTick & 0x800n) !== 0n) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
  if ((absTick & 0x1000n) !== 0n) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
  if ((absTick & 0x2000n) !== 0n) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
  if ((absTick & 0x4000n) !== 0n) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
  if ((absTick & 0x8000n) !== 0n) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
  if ((absTick & 0x10000n) !== 0n) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
  if ((absTick & 0x20000n) !== 0n) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
  if ((absTick & 0x40000n) !== 0n) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
  if ((absTick & 0x80000n) !== 0n) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;

  if (tick > 0) ratio = MAX_UINT256 / ratio;

  const shifted = ratio >> 32n;
  return shifted + (ratio % (1n << 32n) === 0n ? 0n : 1n);
}

// Port of Uniswap V3's LiquidityAmounts.getAmount{0,1}ForLiquidity.
function getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
  if (sqrtRatioAX96 > sqrtRatioBX96) [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  return ((liquidity << 96n) * (sqrtRatioBX96 - sqrtRatioAX96)) / sqrtRatioBX96 / sqrtRatioAX96;
}

function getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity) {
  if (sqrtRatioAX96 > sqrtRatioBX96) [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
  return (liquidity * (sqrtRatioBX96 - sqrtRatioAX96)) / Q96;
}

// Port of Uniswap V3's LiquidityAmounts.getAmountsForLiquidity.
function getAmountsForLiquidity(sqrtPriceX96, tickLower, tickUpper, liquidity) {
  if (liquidity === 0n) return [0n, 0n];
  const sqrtRatioAX96 = getSqrtRatioAtTick(tickLower);
  const sqrtRatioBX96 = getSqrtRatioAtTick(tickUpper);
  if (sqrtPriceX96 <= sqrtRatioAX96) {
    return [getAmount0ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity), 0n];
  } else if (sqrtPriceX96 < sqrtRatioBX96) {
    return [
      getAmount0ForLiquidity(sqrtPriceX96, sqrtRatioBX96, liquidity),
      getAmount1ForLiquidity(sqrtRatioAX96, sqrtPriceX96, liquidity),
    ];
  }
  return [0n, getAmount1ForLiquidity(sqrtRatioAX96, sqrtRatioBX96, liquidity)];
}

const config = {
  celo: {
    factory: '0xa431a0bD0978d872C720cD3E3277e31cd6026e90',
    positionManager: '0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A',
  },
  arbitrum: {
    // VaultFactoryArb — a fork of VaultFactory that derives token0/token1
    // ordering from the pool itself instead of assuming Celo's order.
    factory: '0x93590F9a18Ed444dD90ECBeCA094aa9367452472',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },
};

const positionsAbi =
  'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)';
const slot0Abi =
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)';

function tvl(chain) {
  return async (api) => {
    const { factory, positionManager } = config[chain];

    const vaults = await api.fetchList({ target: factory, lengthAbi: 'vaultCount', itemAbi: 'allVaults' });
    if (!vaults.length) return;

    const [token0s, token1s, pools, tokenIds] = await Promise.all([
      api.multiCall({ calls: vaults, abi: 'address:token0' }),
      api.multiCall({ calls: vaults, abi: 'address:token1' }),
      api.multiCall({ calls: vaults, abi: 'address:pool' }),
      api.multiCall({ calls: vaults, abi: 'uint256:positionTokenId' }),
    ]);

    // Idle funds sitting directly in each vault (waiting to be deployed, or
    // dust left over from the last mint/rebalance) — read as raw ERC20
    // balances rather than the vault's internal ledgers, so this reflects
    // actual on-chain funds regardless of accounting-variable drift.
    const [token0Idle, token1Idle] = await Promise.all([
      api.multiCall({ calls: vaults.map((v, i) => ({ target: token0s[i], params: [v] })), abi: 'erc20:balanceOf' }),
      api.multiCall({ calls: vaults.map((v, i) => ({ target: token1s[i], params: [v] })), abi: 'erc20:balanceOf' }),
    ]);
    vaults.forEach((_, i) => {
      api.add(token0s[i], token0Idle[i]);
      api.add(token1s[i], token1Idle[i]);
    });

    // Each vault with an open position holds exactly one Uniswap V3 NFT;
    // value it from the position's liquidity + tick range against the
    // pool's current price (same math Uniswap's own periphery uses).
    const openVaultIdx = [];
    vaults.forEach((_, i) => {
      if (BigInt(tokenIds[i]) !== 0n) openVaultIdx.push(i);
    });
    if (!openVaultIdx.length) return;

    const uniquePools = [...new Set(openVaultIdx.map((i) => pools[i]))];
    const [positionsData, slot0s] = await Promise.all([
      api.multiCall({
        target: positionManager,
        calls: openVaultIdx.map((i) => ({ params: [tokenIds[i]] })),
        abi: positionsAbi,
      }),
      api.multiCall({ calls: uniquePools, abi: slot0Abi }),
    ]);
    const sqrtPriceByPool = Object.fromEntries(uniquePools.map((p, i) => [p, BigInt(slot0s[i].sqrtPriceX96)]));

    openVaultIdx.forEach((vaultI, j) => {
      const pos = positionsData[j];
      const sqrtPriceX96 = sqrtPriceByPool[pools[vaultI]];
      const [amount0, amount1] = getAmountsForLiquidity(
        sqrtPriceX96,
        Number(pos.tickLower),
        Number(pos.tickUpper),
        BigInt(pos.liquidity)
      );
      api.add(token0s[vaultI], amount0);
      api.add(token1s[vaultI], amount1);
    });
  };
}

module.exports = {
  methodology:
    "Sums, for every vault deployed by AutoRange's VaultFactory/VaultFactoryArb, the vault's idle token0/token1 balances plus the underlying token0/token1 amounts of its open Uniswap V3 concentrated-liquidity position (derived from the position's liquidity and tick range against the pool's current price, same as Uniswap's own LiquidityAmounts library).",
  celo: { tvl: tvl('celo') },
  arbitrum: { tvl: tvl('arbitrum') },
};
