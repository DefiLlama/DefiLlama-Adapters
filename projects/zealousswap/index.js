const { uniTvlExport } = require("../helper/unknownTokens")

// ---------- Shared ----------
const FACTORY = "0x98Bb580A77eE329796a79aBd05c6D2F2b3D5E1bD"

const inf_pols_abi = {
    totalStaked: "function totalStaked() view returns (uint256)",
    totalRewards: "function totalRewards() view returns (uint256)",
    decimals: "function decimals() view returns (uint8)",
}

// ---------- Kasplex ----------
const KASPLEX_INF_POOLS = [
    ["0xb7a95035618354D9ADFC49Eca49F38586B624040", "0x1E7748BA1d372186a322E7CfaAB1306f19FfB897"], // ZEAL
    ["0x9a5a144290dffA24C6c7Aa8cA9A62319E60973D8", "0x0d4f07811718C0eE57EA2FCDb844c3585ae0F315"], // NACHO
    ["0x1F3Ce97f8118035dba7FBCd5398005491Cf45603", "0xa1074f1cD056862ebA654344518aa8c6DE0afE74"], // KASPER
]

const KASPLEX_ADDRESS_TO_CG = {
    "0xb7a95035618354d9adfc49eca49f38586b624040": "zeal",
    "0x9a5a144290dffa24c6c7aa8ca9a62319e60973d8": "nacho-the-kat",
    "0x1f3ce97f8118035dba7fbcd5398005491cf45603": "kasper",
}

// ---------- Igra ----------
const IGRA_INF_POOLS = [
    ["0x76F8A377e18f79170aC2f8b34e26E2Ca7168a556", "0x635439Aa4e5801B761d566534E6685Be2A5e908C"], // ZEAL
    ["0x0F85B69Da77DF32Fe2434e7FD705B9cb18Dd8982", "0x6939d93E61A7dF44AE4fCC04CFac87741A83b7f4"], // NACHO
]

const IGRA_ADDRESS_TO_CG = {
    "0x76f8a377e18f79170ac2f8b34e26e2ca7168a556": "zeal",
    "0x0f85b69da77df32fe2434e7fd705b9cb18dd8982": "nacho-the-kat",
}

function makeInfinityPools(infPools, addressToCG, chain) {
    return async function infinityPools(api) {
        const poolCalls = infPools.map(([, pool]) => ({ target: pool }))
        const tokenCalls = infPools.map(([token]) => ({ target: token }))

        const [stakedArr, rewardsArr, decimalsArr] = await Promise.all([
            api.multiCall({ abi: inf_pols_abi.totalStaked, calls: poolCalls, permitFailure: true }),
            api.multiCall({ abi: inf_pols_abi.totalRewards, calls: poolCalls, permitFailure: true }),
            api.multiCall({ abi: inf_pols_abi.decimals, calls: tokenCalls, permitFailure: true }),
        ])

        const balances = {}

        for (let i = 0; i < infPools.length; i++) {
            const [token] = infPools[i]
            const st = stakedArr?.[i]
            const rw = rewardsArr?.[i]
            const dec = decimalsArr?.[i]
            if (st == null || rw == null || dec == null) continue

            const accounted = BigInt(st) + BigInt(rw)
            if (accounted === 0n) continue

            const decimals = Number(dec)
            const divisor = 10 ** decimals
            const human = Number(accounted) / divisor

            const key = addressToCG[token.toLowerCase()] || `${chain}:${token}`
            balances[key] = (balances[key] || 0) + human
        }

        return balances
    }
}

const kasplexBase = uniTvlExport("kasplex", FACTORY)
const igraBase = uniTvlExport("igra", FACTORY)

module.exports = {
    kasplex: {
        tvl: kasplexBase["kasplex"].tvl,
        staking: makeInfinityPools(KASPLEX_INF_POOLS, KASPLEX_ADDRESS_TO_CG, "kasplex"),
    },
    igra: {
        tvl: igraBase["igra"].tvl,
        staking: makeInfinityPools(IGRA_INF_POOLS, IGRA_ADDRESS_TO_CG, "igra"),
    },
}

