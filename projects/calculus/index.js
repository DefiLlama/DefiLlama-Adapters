const CALCULUS_CONTRACT = "0xb5e6AdA1466840096FcEDCC409528a9cB763f650";
const START_BLOCK = 66651811;

const PANCAKE_V3_FACTORY = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865";
const PANCAKE_V3_NPM = "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364";

const VAULT_POSITION_OPENED_EVENT =
    "event VaultPositionOpened(uint64 indexed operationNonce, uint32 vaultId, uint128 liquidity, address liquidityOwner, int24 tickLower, uint160 sqrtOpen, int24 tickUpper, uint256 reserve0, uint256 reserve1, address operator)";

const LIST_VAULTS_ABI =
    "function listVaults(uint32[] _vaultIds) view returns (uint64, (uint16 tokenPairId, uint32 vaultId, address owner, (uint256 amount0, uint256 amount1) feeEarned, (uint256 amount0, uint256 amount1) reserves, (uint256 tokenId) position)[])";

const NPM_POSITIONS_ABI =
    "function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)";

const FACTORY_GETPOOL_ABI =
    "function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)";

const POOL_SLOT0_ABI =
    "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)";

const ERC20_BALANCEOF_ABI = "function balanceOf(address) view returns (uint256)";

const ZERO = "0x0000000000000000000000000000000000000000";

function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

async function getAllVaultIds(api) {
    const toBlock = await api.getBlock();

    const logs = await api.getLogs({
        target: CALCULUS_CONTRACT,
        eventAbi: VAULT_POSITION_OPENED_EVENT,
        fromBlock: START_BLOCK,
        toBlock,
    });

    const set = new Set();
    for (const l of logs) {
        const raw = l.vaultId ?? l.args?.vaultId ?? l.data?.vaultId ?? l?.[1];
        const id = Number(raw);
        if (Number.isFinite(id)) set.add(id);
    }

    return Array.from(set);
}

const Q96 = 1n << 96n;
const MIN_TICK = -887272;
const MAX_TICK = 887272;
const MIN_SQRT_RATIO = 4295128739n;
const MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342n;

function getSqrtRatioAtTick(tick) {
    if (tick < MIN_TICK || tick > MAX_TICK) throw new Error("TICK_OUT_OF_RANGE");

    let absTick = tick < 0 ? -tick : tick;
    let ratio =
        absTick & 0x1
            ? 0xfffcb933bd6fad37aa2d162d1a594001n
            : 0x100000000000000000000000000000000n;

    if (absTick & 0x2) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
    if (absTick & 0x4) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
    if (absTick & 0x8) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
    if (absTick & 0x10) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
    if (absTick & 0x20) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
    if (absTick & 0x40) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
    if (absTick & 0x80) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
    if (absTick & 0x100) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
    if (absTick & 0x200) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
    if (absTick & 0x400) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
    if (absTick & 0x800) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
    if (absTick & 0x1000) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
    if (absTick & 0x2000) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
    if (absTick & 0x4000) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
    if (absTick & 0x8000) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
    if (absTick & 0x10000) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
    if (absTick & 0x20000) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
    if (absTick & 0x40000) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
    if (absTick & 0x80000) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;

    if (tick > 0) ratio = (2n ** 256n - 1n) / ratio;

    const sqrtPriceX96 = (ratio >> 32n) + (ratio % (1n << 32n) === 0n ? 0n : 1n);

    if (sqrtPriceX96 < MIN_SQRT_RATIO || sqrtPriceX96 >= MAX_SQRT_RATIO)
        throw new Error("SQRT_RATIO_OUT_OF_RANGE");

    return sqrtPriceX96;
}

function mulDiv(a, b, denom) {
    return (a * b) / denom;
}

function getAmount0ForLiquidity(sqrtA, sqrtB, liquidity) {
    if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA];
    const numerator1 = liquidity << 96n;
    const numerator2 = sqrtB - sqrtA;
    return mulDiv(mulDiv(numerator1, numerator2, sqrtB), 1n, sqrtA);
}

function getAmount1ForLiquidity(sqrtA, sqrtB, liquidity) {
    if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA];
    return mulDiv(liquidity, sqrtB - sqrtA, Q96);
}

function getAmountsForPosition(liquidity, sqrtPriceX96, tickLower, tickUpper) {
    const sqrtLower = getSqrtRatioAtTick(tickLower);
    const sqrtUpper = getSqrtRatioAtTick(tickUpper);

    if (sqrtPriceX96 <= sqrtLower) {
        return { amount0: getAmount0ForLiquidity(sqrtLower, sqrtUpper, liquidity), amount1: 0n };
    } else if (sqrtPriceX96 < sqrtUpper) {
        return {
            amount0: getAmount0ForLiquidity(sqrtPriceX96, sqrtUpper, liquidity),
            amount1: getAmount1ForLiquidity(sqrtLower, sqrtPriceX96, liquidity),
        };
    } else {
        return { amount0: 0n, amount1: getAmount1ForLiquidity(sqrtLower, sqrtUpper, liquidity) };
    }
}

async function tvl(api) {
    const vaultIds = await getAllVaultIds(api);
    if (!vaultIds.length) return;

    const vaultIdsClean = vaultIds.map(Number).filter((x) => Number.isFinite(x) && x >= 0);

    const tokenIdSet = new Set();
    for (const ids of chunk(vaultIdsClean, 200)) {
        const [, vaults] = await api.call({
            target: CALCULUS_CONTRACT,
            abi: LIST_VAULTS_ABI,
            params: [ids],
        });

        for (const v of vaults) {
            const tokenId = BigInt(v?.position?.tokenId || 0);
            if (tokenId > 0n) tokenIdSet.add(tokenId.toString());
        }
    }

    const tokenIds = Array.from(tokenIdSet).map((x) => BigInt(x));
    if (!tokenIds.length) return;

    const positions = [];
    for (const batch of chunk(tokenIds, 200)) {
        try {
            const res = await api.multiCall({
                target: PANCAKE_V3_NPM,
                abi: NPM_POSITIONS_ABI,
                calls: batch.map((id) => ({ params: [id.toString()] })),
            });
            positions.push(...res);
        } catch (e) {
            for (const id of batch) {
                const p = await api.call({
                    target: PANCAKE_V3_NPM,
                    abi: NPM_POSITIONS_ABI,
                    params: [id.toString()],
                });
                positions.push(p);
            }
        }
    }

    const pools = await api.multiCall({
        abi: FACTORY_GETPOOL_ABI,
        target: PANCAKE_V3_FACTORY,
        calls: positions.map((p) => {
            const a = p.token0.toLowerCase();
            const b = p.token1.toLowerCase();
            const [tokenA, tokenB] = a < b ? [p.token0, p.token1] : [p.token1, p.token0];
            return { params: [tokenA, tokenB, p.fee] };
        }),
    });

    const valid = pools
        .map((pool, i) => ({ pool, i }))
        .filter(({ pool }) => pool && pool.toLowerCase() !== ZERO);

    if (!valid.length) return;

    const slot0s = await api.multiCall({
        abi: POOL_SLOT0_ABI,
        calls: valid.map(({ pool }) => ({ target: pool })),
    });

    const tokenSet = new Set();

    for (let j = 0; j < valid.length; j++) {
        const i = valid[j].i;
        const p = positions[i];
        const slot0 = slot0s[j];

        const liquidity = BigInt(p.liquidity);
        if (liquidity === 0n) continue;

        const token0 = p.token0;
        const token1 = p.token1;

        tokenSet.add(token0.toLowerCase());
        tokenSet.add(token1.toLowerCase());

        const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96);
        const tickLower = Number(p.tickLower);
        const tickUpper = Number(p.tickUpper);

        const { amount0, amount1 } = getAmountsForPosition(liquidity, sqrtPriceX96, tickLower, tickUpper);

        api.add(token0, amount0.toString());
        api.add(token1, amount1.toString());
    }

    const tokens = Array.from(tokenSet);
    if (tokens.length) {
        const bals = await api.multiCall({
            abi: ERC20_BALANCEOF_ABI,
            calls: tokens.map((t) => ({ target: t, params: [CALCULUS_CONTRACT] })),
        });

        for (let i = 0; i < tokens.length; i++) {
            const bal = bals[i];
            if (bal) api.add(tokens[i], bal);
        }
    }
}

module.exports = {
    methodology:
        "Calculus is an LP asset management protocol on BSC. TVL is computed by discovering vaults via VaultPositionOpened events, resolving current active Pancake v3 positions per vault, and converting liquidity into underlying token balances using pool slot0. Idle token balances held by the Calculus contract are included. Uncollected fees are excluded.",
    bsc: { tvl },
    start: START_BLOCK,
};
