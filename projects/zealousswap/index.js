const { uniTvlExport } = require("../helper/unknownTokens")
const { sumTokens2 } = require("../helper/unwrapLPs")

// ---------- AMM TVL ----------
const CHAIN = "kasplex"
const FACTORY = "0x98Bb580A77eE329796a79aBd05c6D2F2b3D5E1bD"

// ---------- Infinity Pools TVL (single-sided staking) ----------
const INF_POOLS = [
    ["0xb7a95035618354D9ADFC49Eca49F38586B624040", "0x1E7748BA1d372186a322E7CfaAB1306f19FfB897"], // ZEAL
    ["0x9a5a144290dffA24C6c7Aa8cA9A62319E60973D8", "0x0d4f07811718C0eE57EA2FCDb844c3585ae0F315"], // NACHO
    ["0x1F3Ce97f8118035dba7FBCd5398005491Cf45603", "0xa1074f1cD056862ebA654344518aa8c6DE0afE74"], // KASPER
]

const inf_pols_abi = {
    totalStaked: "function totalStaked() view returns (uint256)",
    totalRewards: "function totalRewards() view returns (uint256)",
    decimals: "function decimals() view returns (uint8)",
}

const ADDRESS_TO_CG = {
    "0xb7a95035618354d9adfc49eca49f38586b624040": "zeal",
    "0x9a5a144290dffa24c6c7aa8ca9a62319e60973d8": "nacho-the-kat",
    "0x1f3ce97f8118035dba7fbcd5398005491cf45603": "kasper",
}

async function infinityPools(api) {
    const poolCalls = INF_POOLS.map(([, pool]) => ({ target: pool }))
    const tokenCalls = INF_POOLS.map(([token]) => ({ target: token }))

    const [stakedArr, rewardsArr, decimalsArr] = await Promise.all([
        api.multiCall({ abi: inf_pols_abi.totalStaked, calls: poolCalls, permitFailure: true }),
        api.multiCall({ abi: inf_pols_abi.totalRewards, calls: poolCalls, permitFailure: true }),
        api.multiCall({ abi: inf_pols_abi.decimals, calls: tokenCalls, permitFailure: true }),
    ])

    const balances = {}

    for (let i = 0; i < INF_POOLS.length; i++) {
        const [token] = INF_POOLS[i]
        const st = stakedArr?.[i]
        const rw = rewardsArr?.[i]
        const dec = decimalsArr?.[i]
        if (st == null || rw == null || dec == null) continue

        const accounted = BigInt(st) + BigInt(rw)
        if (accounted === 0n) continue

        const decimals = Number(dec)
        const divisor = 10 ** decimals
        const human = Number(accounted) / divisor

        const key = ADDRESS_TO_CG[token.toLowerCase()] || `${CHAIN}:${token}`
        balances[key] = (balances[key] || 0) + human
    }

    return balances
}

// ---------- Farms TVL ----------
const FARMS = "0x97ac386fFf8d25Bc3F949194f74a79E94617bc7F"

const farms_abi = {
    poolLength: "function poolLength() view returns (uint256)",
    getActivePools: "function getActivePools() view returns (uint256[])",
    poolInfo:
        "function poolInfo(uint256) view returns (address lpToken,uint256 allocPoint,uint256 lastRewardBlock,uint256 accRewardPerShare,uint256 totalDeposited,bool isActive,bool isRemoved)",
}

async function farmsLP(api) {
    let pids = await api.call({ abi: farms_abi.getActivePools, target: FARMS }).catch(() => null)
    if (!pids) {
        const len = await api.call({ abi: farms_abi.poolLength, target: FARMS })
        pids = Array.from({ length: Number(len) }, (_, i) => i)
    }

    const infos = await api.multiCall({
        abi: farms_abi.poolInfo,
        calls: pids.map((pid) => ({ target: FARMS, params: [pid] })),
        permitFailure: true,
    })

    const tokensAndOwners = []
    for (const info of infos) {
        if (!info) continue
        const { lpToken, isActive, isRemoved } = info
        if (!lpToken || isRemoved || !isActive) continue
        tokensAndOwners.push([lpToken, FARMS])
    }

    return sumTokens2({
        api,
        tokensAndOwners,
        resolveLP: true,
        useDefaultCoreAssets: true,
    })
}

const base = uniTvlExport(CHAIN, FACTORY)

module.exports = {
    [CHAIN]: {
        tvl: async (api) => {
            const amm = await base[CHAIN].tvl(api)
            const staking = await infinityPools(api)
            Object.entries(staking).forEach(([token, val]) => {
                amm[token] = (amm[token] ?? 0) + val
            })
            return amm
        },
        staking: infinityPools,
        pool2: farmsLP,
    },
}

