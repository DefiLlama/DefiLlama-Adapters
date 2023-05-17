const sdk = require("@defillama/sdk");

const ADMIN_CONTRACT_ADDRESS = "0xf7Cc67326F9A1D057c1e4b110eF6c680B13a1f53";
const BORROWER_OPS_ADDRESS = "0x2bCA0300c2aa65de6F19c2d241B54a445C9990E2";
const STABILITY_POOL_ADDRESS = "0x4F39F12064D83F6Dd7A2BDb0D53aF8be560356A6";
const GRAI_TOKEN_ADDRESS = "0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4";

const USE_STAKED_GRAI = false;

/**
 * Returns an array of addresses containing the collateral tokens accepted by the platform.
 */
async function _getCollateralAddresses(api) {
  return await api.call({
    abi: "function getValidCollateral() external view returns (address[])",
    target: ADMIN_CONTRACT_ADDRESS,
  });
}

/**
 * Returns the sum of collateral deposited in the ActivePool and DefaultPool.
 */
async function _getCollateralBalance(api, collAddress) {
  return await api.call({
    abi: "function getEntireSystemColl(address) public view returns (uint256)",
    target: BORROWER_OPS_ADDRESS,
    params: [collAddress],
  });
}

/**
 * Returns the total amount of GRAI deposited in Gravita's Stability Pool.
 */
async function _getStabilityPoolDeposits(api) {
  return await api.call({
    abi: "function getTotalDebtTokenDeposits() external view returns (uint256)",
    target: STABILITY_POOL_ADDRESS,
  });
}

async function tvl(_, _1, _2, { api }) {
  const balances = {};
  const collAddresses = await _getCollateralAddresses(api);
  for (const collAddress of collAddresses) {
    const collBalance = await _getCollateralBalance(api, collAddress);
    sdk.util.sumSingleBalance(balances, collAddress, collBalance, api.chain);
  }
  if (USE_STAKED_GRAI) {
    const spDepositBalance = await _getStabilityPoolDeposits(api);
    sdk.util.sumSingleBalance(
      balances,
      GRAI_TOKEN_ADDRESS,
      spDepositBalance,
      api.chain
    );
  }
  return balances;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    "Total Value Locked as Collateral on the Gravita platform + GRAI tokens deposited on our Stability Pool",
  start: 1684256400, // Tuesday, May 15, 2023 17:00 GMT
  ethereum: {
    tvl,
  },
};
