const sdk = require("@defillama/sdk")
const { uniTvlExport } = require("../helper/unknownTokens")

// ---------- Shared ----------
const FACTORY = "0x98Bb580A77eE329796a79aBd05c6D2F2b3D5E1bD"

const inf_pols_abi = {
    totalStaked: "function totalStaked() view returns (uint256)",
    totalRewards: "function totalRewards() view returns (uint256)",
    decimals: "function decimals() view returns (uint8)",
}

const ADDRESS_TO_CG = {
    "0xb7a95035618354d9adfc49eca49f38586b624040": "zeal",          // ZEAL (kasplex)
    "0x76f8a377e18f79170ac2f8b34e26e2ca7168a556": "zeal",          // ZEAL (igra)
    "0x9a5a144290dffa24c6c7aa8ca9a62319e60973d8": "nacho-the-kat", // NACHO (kasplex)
    "0x0f85b69da77df32fe2434e7fd705b9cb18dd8982": "nacho-the-kat", // NACHO (igra)
    "0x1f3ce97f8118035dba7fbcd5398005491cf45603": "kasper",        // KASPER (kasplex)
}

// Infinity Pool vaults, as [underlyingToken, pool]. NACHO / KASPER are third-party
// Kaspa tokens -> counted as TVL. ZEAL is our own token -> reported under staking.

// ---------- Kasplex ----------
const KASPLEX_TVL_POOLS = [
    ["0x9a5a144290dffA24C6c7Aa8cA9A62319E60973D8", "0x0d4f07811718C0eE57EA2FCDb844c3585ae0F315"], // NACHO
    ["0x1F3Ce97f8118035dba7FBCd5398005491Cf45603", "0xa1074f1cD056862ebA654344518aa8c6DE0afE74"], // KASPER
]
const KASPLEX_STAKING_POOLS = [
    ["0xb7a95035618354D9ADFC49Eca49F38586B624040", "0x1E7748BA1d372186a322E7CfaAB1306f19FfB897"], // ZEAL
]

// ---------- Igra ----------
const IGRA_TVL_POOLS = [
    ["0x0F85B69Da77DF32Fe2434e7FD705B9cb18Dd8982", "0x6939d93E61A7dF44AE4fCC04CFac87741A83b7f4"], // NACHO
]
const IGRA_STAKING_POOLS = [
    ["0x76F8A377e18f79170aC2f8b34e26E2Ca7168a556", "0x635439Aa4e5801B761d566534E6685Be2A5e908C"], // ZEAL
]

// Infinity Pools are single-asset vaults: depositors receive a transferable xToken
// (xZEAL / xNACHO) receipt that appreciates against the underlying via an exchange
// rate. Value held by each vault = totalStaked + totalRewards, denominated in the
// underlying token. Tokens are priced via CoinGecko.
async function addInfinityPools(api, balances, infPools, chain) {
    if (!infPools.length) return balances

    const poolCalls = infPools.map(([, pool]) => ({ target: pool }))
    const tokenCalls = infPools.map(([token]) => ({ target: token }))

    const [stakedArr, rewardsArr, decimalsArr] = await Promise.all([
        api.multiCall({ abi: inf_pols_abi.totalStaked, calls: poolCalls, permitFailure: true }),
        api.multiCall({ abi: inf_pols_abi.totalRewards, calls: poolCalls, permitFailure: true }),
        api.multiCall({ abi: inf_pols_abi.decimals, calls: tokenCalls, permitFailure: true }),
    ])

    for (let i = 0; i < infPools.length; i++) {
        const [token] = infPools[i]
        const st = stakedArr?.[i]
        const rw = rewardsArr?.[i]
        const dec = decimalsArr?.[i]
        if (st == null || rw == null || dec == null) continue

        const accounted = BigInt(st) + BigInt(rw)
        if (accounted === 0n) continue

        const raw = Number(accounted)
        const human = raw / 10 ** Number(dec)

        const cg = ADDRESS_TO_CG[token.toLowerCase()]
        const key = cg ? `coingecko:${cg}` : `${chain}:${token}`
        sdk.util.sumSingleBalance(balances, key, cg ? human : raw)
    }

    return balances
}

// Combines the UniV2 factory (liquidity pools) TVL with the third-party Infinity Pool vaults.
function makeTvl(factoryTvl, tvlPools, chain) {
    return async function tvl(api) {
        const balances = (await factoryTvl(api)) || {}
        await addInfinityPools(api, balances, tvlPools, chain)
        return balances
    }
}

// ZEAL Infinity Pool vaults, reported as staking since ZEAL is our own token.
function makeStaking(stakingPools, chain) {
    return async function staking(api) {
        return addInfinityPools(api, {}, stakingPools, chain)
    }
}

const kasplexBase = uniTvlExport("kasplex", FACTORY)
const igraBase = uniTvlExport("igra", FACTORY)

module.exports = {
    kasplex: {
        tvl: makeTvl(kasplexBase["kasplex"].tvl, KASPLEX_TVL_POOLS, "kasplex"),
        staking: makeStaking(KASPLEX_STAKING_POOLS, "kasplex"),
    },
    igra: {
        tvl: makeTvl(igraBase["igra"].tvl, IGRA_TVL_POOLS, "igra"),
        staking: makeStaking(IGRA_STAKING_POOLS, "igra"),
    },
}
