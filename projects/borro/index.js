const { getLogs2 } = require("../helper/cache/getLogs")
const abi = require("../helper/abis/morpho.json")
const { nullAddress } = require("../helper/tokenMapping")

// Borro (borro.markets) lends stock tokens on Robinhood Chain. It creates and curates its own
// isolated markets on the chain's shared Morpho Blue deployment, two per stock:
//   - a stock-loan market: the stock token is the loan asset, Steakhouse USDG vault shares are the
//     collateral, and shorters borrow the stock from it;
//   - a USDG market: USDG is the loan asset and the Borro stock vault's shares (bNVDA etc.) are the
//     collateral, so a lender can borrow USDG against the stock it has lent.
// Ten Morpho Vault V2s (one per stock plus a USDG vault) supply these markets through their adapters.
//
// The deployment is shared with other curators (Longbow and others), so the singleton's token
// balances cannot be attributed by a token union; the markets are enumerated instead and each is
// attributed from its own state, exactly as projects/longbow does on the same deployment.
//
// tvl per market = (totalSupplyAssets - totalBorrowAssets) + collateral
//   the first term is the loan-asset cash Morpho still holds for the market; borrowed assets have
//   left the contract and are reported under borrowed instead. Collateral is replayed from the
//   three events that move it (Morpho exposes no aggregate collateral getter).
//   Collateral that is itself a Borro vault share (bNVDA posted on the USDG markets) is NOT added:
//   the stock behind that share is already counted in the stock-loan market above, and adding the
//   share again would double count it.
// tvl per vault = what the vault holds outside these markets: its asset sitting idle in the vault,
//   plus whatever a non-market adapter holds (the USDG vault can park idle USDG in Steakhouse's USDG
//   vault through a Morpho Vault V1 adapter). What the vaults supply into the markets is already
//   inside totalSupplyAssets and is not added again.
// Marked double counted because Morpho Blue reports these markets too, and the Steakhouse shares
// posted as collateral are counted by Steakhouse.
const MORPHO = "0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010"
const FROM_BLOCK = 80804673 // Borro deployment block (2026-10-05)

const USDG_VAULT = "0xF8e0ab443098c0738489B5BAFFbd32A1341F2289" // bUSDG

// symbol: [stock vault (bSTOCK), stock-loan market id, USDG market id]
const desks = {
  SPY: ["0xC3ED4a5A7dB4102F4Ed37Af26ef0d3f21e2360c1", "0x1cd22321a4d27054a8cd029c73c53432e8a231f8df1a3981b1ae1c274175d381", "0xb1453a889f92101054ab8095e0cc5e303f8c797f6ece3f688c7a1e1780a134a6"],
  QQQ: ["0xbAD8A97dA1050092d6a14194D53E72D407D6cc17", "0xfbeb9596a8a0202dde46de7a49af15ee963c8678a71edb6dd1c8b283595cbdae", "0xea3cf9bf1f245dc905b007312ca7f9cc83ddd4f163398fa2ff22a829d8615454"],
  NVDA: ["0x508E23274C39C60c345e35B1f0188bE180717CB9", "0x7ff4053d7caa99de7aa19febadcc2178377e8a31b163046539d6fb35c5abc08b", "0xf3524baf7647833311fe49cfea9153664b0284574e804f5078ec7e100fb86529"],
  TSLA: ["0x60b3d353E7e5bD12ED4Ea2589C11B5603dd4c988", "0x5c0a634f28ac0f699be3b2db5265a935d63cfb680fd28bc5b225adaaabda8b88", "0x0036d2bac326d26797b9247d61db7b034290cad2bb210f1c6e6853ad0e4fbf0f"],
  MSTR: ["0x2B74f8F2b76cd4e97265BC37FB2578a04B8437e9", "0x0fc6938b8b73689ee822ff59b775972931f33dfda49880b43b05a14396111a9d", "0xcc55ee44304cf35b1ad5b10512619a7101d0d4424750b8075338501d571dbccb"],
  COIN: ["0x7BA71BCCeCb12860aE7E141B6b6F1f8B96d31257", "0x7eb15a4033030e5cbf34ea1823545b918d29e5e59e7d8c1d35aee2df3e114c98", "0xd6dd43ddb2ffeb1119e2df2a651b342b323ab34fa9bb39dfb5651717f909e997"],
  PLTR: ["0xFE9419E70e5481F7a2dDddc18f856b09b3687B27", "0x85571555a4d98cb7efaf91ffd5a9d6b2db33d4a631c6b16633e537ac6cb4b590", "0x405485f81cee0d066bd29d3556b17f5c50b01f542314d52ca93612f1d0a315ca"],
  SPCX: ["0x1261210E19052157fCe2064D9aa9A2140Bd89791", "0x4219a85fc09ae2ff5d3aa29013c67c89142f80a9c71d5c15ed7dbf9f6e14ae81", "0xb7da3d3030524ffc9438524054d4adf337904e228a842f8b35bf472ad16426e6"],
  GME: ["0x328461fB01F54C2Ab73909EA947c583d0dC24C3d", "0xde233c6decb5b2ad4a2fd63ef8c95ee9b1934c0bd849e87fb5604e845ceb2c82", "0x75d38c9976e6d899662a19a39ac679cfbf711edb6e8ea4762ad2746c480f894c"],
}

const vaults = [USDG_VAULT, ...Object.values(desks).map((d) => d[0])]
const vaultSet = new Set(vaults.map((v) => v.toLowerCase()))
const markets = Object.values(desks).flatMap((d) => [d[1], d[2]])

const vaultAbi = {
  adaptersLength: "uint256:adaptersLength",
  adapters: "function adapters(uint256) view returns (address)",
  morphoVaultV1: "address:morphoVaultV1",
  realAssets: "uint256:realAssets",
}

const eventAbis = {
  supplyCollateral: "event SupplyCollateral(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets)",
  withdrawCollateral: "event WithdrawCollateral(bytes32 indexed id, address caller, address indexed onBehalf, address indexed receiver, uint256 assets)",
  liquidate: "event Liquidate(bytes32 indexed id, address indexed caller, address indexed borrower, uint256 repaidAssets, uint256 repaidShares, uint256 seizedAssets, uint256 badDebtAssets, uint256 badDebtShares)",
}

// Net collateral per market id, replayed from the only three events that change it.
async function collateralByMarket(api, toBlock) {
  const wanted = new Set(markets.map((i) => i.toLowerCase()))
  const net = {}
  const apply = (id, delta) => {
    const key = id.toLowerCase()
    if (!wanted.has(key)) return
    net[key] = (net[key] || 0n) + delta
  }

  // getLogs keys its cache on chain/target, so each event against the one singleton needs its own
  // extraKey. toBlock (tvl's safeBlock) is held back from the head because the cache is append-only. No
  // fallback to a possibly stale cache: if the logs cannot be read up to toBlock the run fails rather
  // than reporting a collateral total that silently misses recent events.
  const sweep = (eventAbi, extraKey) =>
    getLogs2({ api, target: MORPHO, eventAbi, fromBlock: FROM_BLOCK, toBlock, onlyArgs: true, extraKey })

  const [supplied, withdrawn, liquidated] = await Promise.all([
    sweep(eventAbis.supplyCollateral, "borro-supplyCollateral"),
    sweep(eventAbis.withdrawCollateral, "borro-withdrawCollateral"),
    sweep(eventAbis.liquidate, "borro-liquidate"),
  ])

  supplied.forEach((i) => apply(i.id, BigInt(i.assets)))
  withdrawn.forEach((i) => apply(i.id, -BigInt(i.assets)))
  liquidated.forEach((i) => apply(i.id, -BigInt(i.seizedAssets)))

  for (const [id, amount] of Object.entries(net))
    if (amount < 0n) throw new Error(`borro: negative collateral replayed for market ${id}`)

  return net
}

async function marketState(api) {
  const [params, data] = await Promise.all([
    api.multiCall({ target: MORPHO, abi: abi.morphoBlueFunctions.idToMarketParams, calls: markets }),
    api.multiCall({ target: MORPHO, abi: abi.morphoBlueFunctions.market, calls: markets }),
  ])
  return { params, data }
}

// What the vaults hold outside Borro's markets: idle asset in the vault, and anything a Morpho
// Vault V1 adapter holds in another vault (the USDG vault's Steakhouse adapter).
async function vaultHoldings(api) {
  const assets = await api.multiCall({ abi: "address:asset", calls: vaults })
  const idle = await api.multiCall({ abi: "erc20:balanceOf", calls: vaults.map((v, i) => ({ target: assets[i], params: v })) })
  vaults.forEach((_, i) => api.add(assets[i], idle[i]))

  const lengths = await api.multiCall({ abi: vaultAbi.adaptersLength, calls: vaults })
  const adapterCalls = []
  vaults.forEach((vault, i) => {
    for (let j = 0; j < Number(lengths[i]); j++) adapterCalls.push({ target: vault, params: j, asset: assets[i] })
  })
  if (!adapterCalls.length) return
  const adapters = await api.multiCall({ abi: vaultAbi.adapters, calls: adapterCalls })
  // Market adapters have no morphoVaultV1(); their positions are counted market by market above.
  const parents = await api.multiCall({ abi: vaultAbi.morphoVaultV1, calls: adapters, permitFailure: true })
  const vaultV1Adapters = adapters.filter((_, i) => parents[i])
  if (!vaultV1Adapters.length) return
  const held = await api.multiCall({ abi: vaultAbi.realAssets, calls: vaultV1Adapters })
  vaultV1Adapters.forEach((adapter, i) => api.add(adapterCalls[adapters.indexOf(adapter)].asset, held[i]))
}

async function tvl(api) {
  // Every read at one block: the collateral replay can only reach safeBlock (the log cache is append-only),
  // so the market and vault balances are read there too.
  const safeBlock = (await api.getBlock()) - 200
  const previousBlock = api.block
  api.block = safeBlock
  try {
    await tvlAt(api, safeBlock)
  } finally {
    api.block = previousBlock
  }
}

async function tvlAt(api, safeBlock) {
  const [{ params, data }, collateral] = await Promise.all([marketState(api), collateralByMarket(api, safeBlock)])

  markets.forEach((id, i) => {
    const supplied = BigInt(data[i].totalSupplyAssets || 0)
    const borrowedAssets = BigInt(data[i].totalBorrowAssets || 0)
    // Morpho enforces totalBorrowAssets <= totalSupplyAssets; defensive floor only.
    if (supplied > borrowedAssets) api.add(params[i].loanToken, supplied - borrowedAssets)

    const collateralToken = params[i].collateralToken
    if (collateralToken === nullAddress || vaultSet.has(collateralToken.toLowerCase())) return // a Borro vault share: its stock is already counted
    const held = collateral[id.toLowerCase()] || 0n
    if (held > 0n) api.add(collateralToken, held)
  })

  await vaultHoldings(api)
}

async function borrowed(api) {
  const { params, data } = await marketState(api)
  markets.forEach((_, i) => {
    let amount = BigInt(data[i].totalBorrowAssets || 0)
    const supplied = BigInt(data[i].totalSupplyAssets || 0)
    if (amount > supplied) amount = supplied
    if (amount > 0n) api.add(params[i].loanToken, amount)
  })
}

module.exports = {
  doublecounted: true,
  start: "2026-10-05",
  methodology:
    "Counts the isolated Morpho Blue markets Borro creates and curates on Robinhood Chain: a stock-loan market and a USDG market per stock. For each market, TVL is the loan assets still held by Morpho for that market (supplied minus borrowed) plus the borrower collateral posted against it; outstanding debt is reported separately under borrowed. Collateral that is itself a Borro vault share (bNVDA and the rest, posted on the USDG markets) is not added, because the stock behind it is already counted in the stock-loan market. What Borro's Morpho Vault V2s hold outside these markets (idle, or parked in another Morpho vault through an adapter) is added as the vault's asset; what they supply into the markets is counted once, in the markets. Marked double counted because Morpho Blue reports the same markets.",
  robinhood: { tvl, borrowed },
}
