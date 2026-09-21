const VAULT = "0x3993bD557E0d4a1E5A8Ec09a005E7Eee3E032f70"; // CharityPrizeVault
const A_USDC = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB"; // Aave v3 aBasUSDC on Base
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Deposits are supplied to Aave v3, so the vault's position is held as aBasUSDC. The aToken is
// rebasing and 1:1 with the underlying, so its balance is the USDC value of the pool — principal
// plus the yield accrued since the last weekly distribution.
async function tvl(api) {
  const bal = await api.call({
    abi: "erc20:balanceOf",
    target: A_USDC,
    params: [VAULT],
  });
  api.add(USDC, bal);
}

module.exports = {
  methodology:
    "TVL is the CharityPrizeVault's aBasUSDC balance on Base — every USDC deposited by users, " +
    "supplied to Aave v3 to earn interest. Deposits are never spent: only the interest is " +
    "distributed each week (90% to one depositor drawn by Chainlink VRF, 5% to a rotating " +
    "charity, 5% to operations), and depositors can withdraw their full principal at any time. " +
    "Because the underlying position is supplied into Aave v3, this TVL is also counted by Aave " +
    "and should be treated as double counted.",
  start: 1782313227, // 2026-06-24, vault deployment (block 47761940)
  doublecounted: true,
  base: { tvl },
};
