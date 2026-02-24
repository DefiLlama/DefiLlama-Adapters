const ADDRESSES = require("../helper/coreAssets.json");
const { graphQuery } = require("../helper/http");

/*
  Cooler Loans — Olympus DAO's native lending protocol

  Borrowers deposit gOHM as collateral and borrow stablecoins at 0.5% APR.

  V1 (Clearinghouse, July 2023 – present, deprecated):
    - Per-user Cooler contracts created by CoolerFactory
    - Three Clearinghouse versions acted as lenders
    - Collateral: gOHM, Debt: DAI
    - Fixed LTV: 2,892.92 DAI/gOHM, 121-day terms
    - Subgraph returns BigDecimal (human-readable values)

  V2 (MonoCooler, Jan 2025 – present, active):
    - Single contract architecture
    - Collateral: gOHM, Debt: USDS
    - Dynamic LTV via oracle, perpetual terms
    - Subgraph returns BigInt (raw wei, 18 decimals)

  Data source: Cooler Loans subgraph (indexes both V1 and V2)
*/

const COOLER_SUBGRAPH = "4Vicyh7DiEGj6aSamLpAhwydcnaU1CPQgvWApWv7H9Rh";

const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
const USDS = "0xdC035D45d973E3EC169d2276DDab16f1e407384F";

// V1 Clearinghouse addresses
const CLEARINGHOUSES = [
  "0xd6a6e8d9e82534bd65821142fccd91ec9cf31880", // v1.0
  "0xe6343ad0675c9b8d3f32679ae6adba0766a2ab4c", // v1.1
  "0x1e094fe00e13fd06d64eea4fb3cd912893606fe0", // v1.2
];

const V1_LTV = 2892.92; // Fixed DAI per gOHM

// Query latest V1 Clearinghouse snapshots and V2 MonoCooler state in one call
const combinedQuery = `{
  ${CLEARINGHOUSES.map(
    (addr, i) =>
      `ch${i}: clearinghouseSnapshots(
        first: 1,
        orderBy: blockTimestamp,
        orderDirection: desc,
        where: { clearinghouse: "${addr}" }
      ) {
        principalReceivables
        interestReceivables
      }`
  ).join("\n")}
  monoCoolerGlobalSnapshots(
    first: 1,
    orderBy: timestamp,
    orderDirection: desc
  ) {
    totalDebt
    totalCollateral
  }
}`;

// Cache subgraph response — tvl() and borrowed() use the same query
let _cachedData;
async function fetchData() {
  if (!_cachedData) _cachedData = graphQuery(COOLER_SUBGRAPH, combinedQuery);
  return _cachedData;
}

async function tvl(api) {
  // TVL = gOHM collateral locked in the protocol
  const data = await fetchData();

  // V2: gOHM collateral (BigInt, already in wei)
  const v2 = data?.monoCoolerGlobalSnapshots?.[0];
  if (v2) {
    api.add(GOHM, v2.totalCollateral);
  }

  // V1: Derive gOHM collateral from DAI principal receivables
  // V1 subgraph returns BigDecimal (human-readable), so multiply by 1e18
  for (let i = 0; i < CLEARINGHOUSES.length; i++) {
    const snap = data?.[`ch${i}`]?.[0];
    if (!snap) continue;
    const principal = Number(snap.principalReceivables);
    if (principal > 0) {
      const gOhmCollateral = (principal / V1_LTV) * 1e18;
      api.add(GOHM, BigInt(Math.floor(gOhmCollateral)));
    }
  }
}

async function borrowed(api) {
  // Borrowed = outstanding stablecoin debt
  const data = await fetchData();

  // V2: USDS debt (BigInt, already in wei)
  const v2 = data?.monoCoolerGlobalSnapshots?.[0];
  if (v2) {
    api.add(USDS, v2.totalDebt);
  }

  // V1: DAI receivables (BigDecimal, human-readable — multiply by 1e18)
  for (let i = 0; i < CLEARINGHOUSES.length; i++) {
    const snap = data?.[`ch${i}`]?.[0];
    if (!snap) continue;
    const principal = Number(snap.principalReceivables);
    const interest = Number(snap.interestReceivables);
    const totalDebt = principal + interest;
    if (totalDebt > 0) {
      api.add(ADDRESSES.ethereum.DAI, BigInt(Math.floor(totalDebt * 1e18)));
    }
  }
}

module.exports = {
  methodology:
    "TVL is gOHM collateral locked in Cooler Loans (V1 Clearinghouse + V2 MonoCooler). Borrowed is outstanding stablecoin debt (USDS for V2, DAI for V1). Cooler Loans is Olympus DAO's native lending protocol offering fixed-rate, perpetual loans against gOHM collateral at 0.5% APR.",
  start: "2023-07-23",
  timetravel: false,
  ethereum: {
    tvl,
    borrowed,
  },
};
