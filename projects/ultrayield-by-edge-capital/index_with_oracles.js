// projects/ultrayield-curating/index.js
// Сurator adapter that computes TVL for four vault types:
// 1) ERC-4626 (asset() + totalAssets())
// 2) MidasIssuance (supply)
// 3) Boring (rate × supply via hook → accountant)
// 4) Pre-deposit (same as MidasIssuance)


// ------------------------------- ABIs ---------------------------------------
const ABI = {
    ERC4626: {
        asset: 'function asset() view returns (address)',
        totalAssets: 'function totalAssets() view returns (uint256)',
    },
    ERC20: {
        totalSupply: 'function totalSupply() view returns (uint256)',
    },
    // Issuance-like (used by MidasIssuance and Pre-deposit)
    ISSUANCE: {
        // underlying token resolver: try in order
        base: 'function base() view returns (address)',
        asset: 'function asset() view returns (address)',
        underlying: 'function underlying() view returns (address)',
        // rate to underlying (scaled)
        getRate: 'function getRate() view returns (uint256)',
        // optional: rate has its own decimals/scale
        rateDecimals: 'function decimals() view returns (uint8)',
    },
    // Boring Vault (through hook → accountant)
    BORING: {
        hook: 'function hook() view returns (address)',
        accountant: 'function accountant() view returns (address)',
        base: 'function base() view returns (address)',
        getRateSafe: 'function getRateSafe() view returns (uint256)',
        decimals: 'function decimals() view returns (uint8)', // scale for rate
    },
    ORACLE: {
        latestRoundData:
            'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
        decimals: 'function decimals() view returns (uint8)',
    },
}

// ------------------------------ CONFIG --------------------------------------
// Structure per chain:
// {
//   erc4626:        [vaultAddr, ...],
//   midasissuance:  [{ token, source }, ...],   // "source" must expose base()/getRateSafe()/decimals()
//   predeposit:     [{ token, source }, ...],   // same shape & logic as Issuance
//   boring:         [vaultAddr, ...],
// }
const CONFIG = {
    ethereum: {
        // ERC-4626 vaults (RAW underlying via totalAssets)
        erc4626: [
            '0xBb876b2012af9Ca8591723B4fe7F05aC50E6C1eC', // UltraYield cbBTC
            '0xc824A08dB624942c5E5F330d56530cD1598859fD', // Kelp High Growth ETH (rsETH)
            '0x59d675f75f973835b94d02b6d27b8539757dc65f', // Term UltraYield ETH
            '0x2be901715468c3c5393efa841525a713c583a8ec', // Term UltraYield USDC
            '0x0562AE950276B24F3eAE0d0a518dADB7Ad2F8D66', // Morpho Edge UltraYield USDC
            '0x9A6340ce1282e01Cb4Ec9faae5fc5F4b60Ca8839', // Mellow UltraYield × Edge × Allnodes
        ],

        // Midas issuance tokens (USD TVL via on-chain oracle on this chain)
        midasissuance: [
            {token: '0xbB51E2a15A9158EBE2b0Ceb8678511e063AB7a55', oracle: '0x698dA5D987a71b68EbF30C1555cfd38F190406b7'}, // mEDGE
            {token: '0x2a8c22E3b10036f3AEF5875d04f8441d4188b656', oracle: '0xE4f2AE539442e1D3Fb40F03ceEbF4A372a390d24'}, // mBASIS
        ],

        // Pre-deposit tokens (treated like issuance; USD TVL via oracle)
        predeposit: [
            {token: '0x699e04F98dE2Fc395a7dcBf36B48EC837A976490', oracle: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'}, // tacUSD (using provided feed)
        ],

        // Boring vaults (rate × supply via accountant)
        boring: [
            '0xbc0f3B23930fff9f4894914bD745ABAbA9588265', // EtherFi UltraYield Stablecoin (Veda/BoringVault) – shares token
        ],
    },

    // HyperEVM / Hyperliquid
    hyperliquid: {
        erc4626: [
            '0x96C6cBB6251Ee1c257b2162ca0f39AA5Fa44B1FB', // Hyperbeat Ultra HYPE
            '0xc061d38903B99aC12713b550C2cb44B221674F94', // Hyperbeat Ultra UBTC
        ],
        midasissuance: [],
        predeposit: [],
        boring: [],
    },

    // Plume mainnet (issuance tokens present; only mEDGE has an on-chain oracle per the table)
    plume_mainnet: {
        erc4626: [],
        midasissuance: [
            {token: '0x69020311836D29BA7d38C1D3578736fD3dED03ED', oracle: '0x7D5622Aa8Cc259Ae39fBA51f3C1849797FB7e82D'}, // mEDGE (Plume)
            // mBASIS (Plume) token exists but no oracle provided in the table:
            { token: '0x0c78Ca789e826fE339dE61934896F5D170b66d78', oracle: undefined },
        ],
        predeposit: [],
        boring: [],
    },

    // Base (mBASIS token exists; no Base oracle provided in the table)
    base: {
        erc4626: [],
        midasissuance: [
             { token: '0x1C2757c1FeF1038428b5bEF062495ce94BBe92b2', oracle: undefined }, // mBASIS (Base)
        ],
        predeposit: [],
        boring: [],
    },

    // Etherlink (mBASIS & mMEV tokens exist; no Etherlink oracles provided in the table)
    etlk: {
        erc4626: [],
        midasissuance: [
            {token: '0x2247B5A46BB79421a314aB0f0b67fFd11dd37Ee4', oracle: undefined}, // mBASIS (Etherlink)
            // {token: '0x5542F82389b76C23f5848268893234d8A63fd5c8', oracle: undefined}, // mMEV (Etherlink)
        ],
        predeposit: [],
        boring: [],
    },
    // TAC (mEDGE tokens exist; no TAC oracles provided in the table)
    tac: {
        midasissuance: [
            {token: '0x0e07999AFFF029894277C785857b4cA30ec07a5e', oracle: undefined},
        ],
    },
}

// ---------------------------- Utilities -------------------------------------
const toLower = (a) => (typeof a === 'string' ? a.toLowerCase() : a)
const uniqLower = (arr = []) => [...new Set(arr.map(toLower))]

// Chainlink-style price reader that returns { answer(BigInt), decimals(Number) }
async function readOracle(api, oracle) {
    const [rd, pdec] = await Promise.all([
        api.call({target: oracle, abi: ABI.ORACLE.latestRoundData, permitFailure: true}),
        api.call({target: oracle, abi: ABI.ORACLE.decimals, permitFailure: true}),
    ])
    if (!rd || rd.answer == null) return null
    const answer = BigInt(rd.answer ?? rd[1])
    return {answer, decimals: Number(pdec ?? 0)}
}

// Safe Number conversion for USD (best-effort; DefiLlama USD aggregator expects a Number)
function bigMulDivToNumber(aBig, bBig, scale) {
    // WARNING: precision loss is possible for very large values; sufficient for USD TVL display.
    const a = Number(aBig)
    const b = Number(bBig)
    return (a * b) / 10 ** scale
}

// Try multiple ABIs in order and return the first successful non-null result
async function callAny(api, target, abis) {
    for (const abi of abis) {
        const res = await api.call({target, abi, permitFailure: true})
        if (res !== null && res !== undefined) return res
    }
    return null
}

// ---------------------------- TVL: ERC-4626 ---------------------------------
async function tvlErc4626(api, vaults) {
    const list = uniqLower(vaults || [])
    if (!list.length) return
    const [assets, totals] = await Promise.all([
        api.multiCall({abi: ABI.ERC4626.asset, calls: list, permitFailure: true}),
        api.multiCall({abi: ABI.ERC4626.totalAssets, calls: list, permitFailure: true}),
    ])
    for (let i = 0; i < list.length; i++) {
        const asset = assets[i], total = totals[i]
        if (!asset || total == null) continue
        api.add(asset, total)
    }
}

// --------------- TVL: Issuance-like via USD oracle (and Pre-deposit) --------
// items: [{ token, oracle }], where:
//   token  = share-token (ERC20) address
//   oracle = Chainlink-style USD oracle for *that share-token*
// We compute: USD_TVL = totalSupply(token) * price_usd / 10^(token_decimals + oracle_decimals)
// and add it via api.addUSDValue(...).
async function tvlSupplyAsToken(api, items) {
  // items: [{ token }, ...]  (oracle is ignored)
  const L = (items || [])
    .map(x => x && x.token ? toLower(x.token) : null)
    .filter(Boolean)
  if (!L.length) return

  // Read totalSupply for each share-token
  const supplies = await api.multiCall({
    abi: ABI.ERC20.totalSupply,
    calls: L,
    permitFailure: true,
  })

  // Add share-token supplies as balances (RAW units)
  for (let i = 0; i < L.length; i++) {
    const token = L[i]
    const supply = supplies[i]
    if (supply == null) continue
    api.add(token, supply)
    // If you also want a log/debug line, uncomment:
    // console.log('asset', token, 'supply', supply.toString())
  }
}

async function tvlSupplyOracleUSD(api, items) {
    const L = (items || []).map(x => ({token: toLower(x.token), oracle: toLower(x.oracle)}))
    if (!L.length) return

    // Read supplies and token decimals (we only need supply; token decimals are used for scaling)
    const supplies = await api.multiCall({abi: ABI.ERC20.totalSupply, calls: L.map(i => i.token), permitFailure: true})

    // Read oracles (latestRoundData + decimals)
    const oracleResults = await Promise.all(L.map(i => readOracle(api, i.oracle)))

    // Sum USD values across all items
    let usdTotal = 0
    for (let i = 0; i < L.length; i++) {
        const supply = supplies[i]
        const o = oracleResults[i]
        if (supply == null || !o) continue

        // We need token decimals. `api` does not expose token decimals here, so we assume 18 if unknown.
        // If you need exact decimals, add another multiCall for ERC20.decimals.
        // For robustness, let's fetch token decimals now:
        // (Cached by SDK across calls, overhead is small.)
        const tdec = await api.call({
            target: L[i].token,
            abi: 'function decimals() view returns (uint8)',
            permitFailure: true
        })
        const tokenDec = Number(tdec ?? 18)

        const scale = tokenDec + o.decimals
        const usd = bigMulDivToNumber(BigInt(supply), o.answer, scale)
        if (Number.isFinite(usd)) usdTotal += usd
    }

    if (usdTotal > 0) api.addUSDValue(usdTotal)
}

// ----------------------------- TVL: Boring ----------------------------------
// For each boring vault:
//   vault -> hook() -> accountant()
//   accountant: base(), getRateSafe(), decimals()  (rate scale)
//   vault token supply: totalSupply(vault)
async function tvlBoring(api, vaults) {
    const list = uniqLower(vaults || [])
    if (!list.length) return

    const hooks = await api.multiCall({abi: ABI.BORING.hook, calls: list, permitFailure: true})
    const pairs = list.map((v, i) => (hooks[i] ? {vault: v, hook: hooks[i]} : null)).filter(Boolean)
    if (!pairs.length) return

    const accountants = await api.multiCall({
        abi: ABI.BORING.accountant,
        calls: pairs.map(p => p.hook),
        permitFailure: true
    })
    const rows = pairs.map((p, i) => (accountants[i] ? {...p, accountant: accountants[i]} : null)).filter(Boolean)
    if (!rows.length) return

    const [assets, rates, supplies, rateDecs] = await Promise.all([
        api.multiCall({abi: ABI.BORING.base, calls: rows.map(r => r.accountant), permitFailure: true}),
        api.multiCall({abi: ABI.BORING.getRateSafe, calls: rows.map(r => r.accountant), permitFailure: true}),
        api.multiCall({abi: ABI.ERC20.totalSupply, calls: rows.map(r => r.vault), permitFailure: true}),
        api.multiCall({abi: ABI.BORING.decimals, calls: rows.map(r => r.accountant), permitFailure: true}),
    ])

    for (let i = 0; i < rows.length; i++) {
        const asset = assets[i], rate = rates[i], supply = supplies[i]
        if (!asset || rate == null || supply == null) continue
        const scale = Number(rateDecs[i] ?? 18)
        const amt = (BigInt(rate) * BigInt(supply)) / (10n ** BigInt(scale)) // RAW units of the base token
        api.add(asset, amt)
    }
}

// ------------------------------ Orchestrator --------------------------------
async function getCuratorTvl(api, cfg = {}) {
    if (cfg.erc4626 && cfg.erc4626.length) await tvlErc4626(api, cfg.erc4626)
    if (cfg.midasissuance && cfg.midasissuance.length) await tvlSupplyAsToken(api, cfg.midasissuance, 18)
    if (cfg.predeposit && cfg.predeposit.length) await tvlSupplyAsToken(api, cfg.predeposit, 18)
    if (cfg.boring && cfg.boring.length) await tvlBoring(api, cfg.boring)
}

// Return a per-chain tvl function bound to CONFIG
const chainTvl = (chain) => async (_ts, _b, _cb, {api}) => {
    const cfg = CONFIG[chain] || {}
    await getCuratorTvl(api, cfg)
    return api.getBalances()
}

// ------------------------------- Export -------------------------------------

const adapters = {
  timetravel: true,
  doublecounted: true,
  start: 0,
  methodology:
    'TVL = sum of underlying balances: ERC-4626 via totalAssets(); Issuance/Pre-deposit via share totalSupply; Boring via accountant.getRate × vault.totalSupply. All amounts added in RAW units unless USD is explicitly computed.',
}
Object.keys(CONFIG).forEach((chain) => {
  adapters[chain] = { tvl: chainTvl(chain) }
})
module.exports = adapters