const ADDRESSES = require("../helper/coreAssets.json");

/*
  Cooler Loans — Olympus DAO's native lending protocol

  Borrowers deposit gOHM as collateral and borrow stablecoins at 0.5% APR.

  V1 (Clearinghouse, July 2023 – present, deprecated):
    - Per-user Cooler contracts created by CoolerFactory
    - Three Clearinghouse versions acted as lenders
    - Collateral: gOHM, Debt: DAI
    - Fixed LTV: 2,892.92 DAI/gOHM, 121-day terms

  V2 (MonoCooler, Jan 2025 – present, active):
    - Single contract architecture
    - Collateral: gOHM, Debt: USDS
    - Dynamic LTV via oracle, perpetual terms

  Data source: on-chain calls to the Clearinghouse and MonoCooler contracts
*/

const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f";
const USDS = ADDRESSES.ethereum.USDS;

const MONOCOOLER = { address: "0xdb591ea2e5db886da872654d58f6cc584b68e7cc", deployBlock: 22423121 };

// V1 Clearinghouse addresses
const CLEARINGHOUSES = [
  { address: "0xd6a6e8d9e82534bd65821142fccd91ec9cf31880", deployBlock: 18185779 }, // v1.0
  { address: "0xe6343ad0675c9b8d3f32679ae6adba0766a2ab4c", deployBlock: 18234505 }, // v1.1
  { address: "0x1e094fe00e13fd06d64eea4fb3cd912893606fe0", deployBlock: 21216656 }, // v1.2
];

// Fixed V1 LTV of 2,892.92 DAI per gOHM, kept as a fraction so the division stays in integers
const V1_LTV_NUMERATOR = 289292n;
const V1_LTV_DENOMINATOR = 100n;

// Only call contracts that exist at the queried block
async function getDeployedContracts(api) {
  const block = await api.getBlock();
  return {
    monoCoolerDeployed: block >= MONOCOOLER.deployBlock,
    clearinghouses: CLEARINGHOUSES.filter((c) => block >= c.deployBlock).map((c) => c.address),
  };
}

async function tvl(api) {
  // TVL = gOHM collateral locked in the protocol
  const { monoCoolerDeployed, clearinghouses } = await getDeployedContracts(api);

  // V2: gOHM collateral held by MonoCooler
  if (monoCoolerDeployed) {
    api.add(GOHM, await api.call({ abi: "uint128:totalCollateral", target: MONOCOOLER.address }));
  }

  // V1: collateral sits in per-user Cooler contracts, so derive it from DAI principal receivables
  const principals = await api.multiCall({ abi: "uint256:principalReceivables", calls: clearinghouses });
  for (const principal of principals) {
    api.add(GOHM, (BigInt(principal) * V1_LTV_DENOMINATOR) / V1_LTV_NUMERATOR);
  }
}

async function borrowed(api) {
  // Borrowed = outstanding stablecoin debt
  const { monoCoolerDeployed, clearinghouses } = await getDeployedContracts(api);

  // V2: USDS debt, including interest accrued up to the queried block
  if (monoCoolerDeployed) {
    api.add(USDS, await api.call({ abi: "uint128:totalDebt", target: MONOCOOLER.address }));
  }

  // V1: DAI principal and interest receivables
  const [principals, interests] = await Promise.all([
    api.multiCall({ abi: "uint256:principalReceivables", calls: clearinghouses }),
    api.multiCall({ abi: "uint256:interestReceivables", calls: clearinghouses }),
  ]);
  principals.forEach((principal, i) => {
    api.add(ADDRESSES.ethereum.DAI, BigInt(principal) + BigInt(interests[i]));
  });
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
