const { sumTokens2 } = require("../helper/unwrapLPs");

const ADMIN_CONTRACT_ADDRESS = "0xf7Cc67326F9A1D057c1e4b110eF6c680B13a1f53";

/**
 * Returns an array of addresses containing the collateral tokens accepted by the platform.
 */
async function _getCollateralAddresses(api) {
  return api.call({
    abi: "function getValidCollateral() external view returns (address[])",
    target: ADMIN_CONTRACT_ADDRESS,
  });
}

async function tvl(_, _1, _2, { api }) {
  const collAddresses = await _getCollateralAddresses(api);
  const pool = await api.call({  abi: 'address:activePool', target: ADMIN_CONTRACT_ADDRESS})
  return sumTokens2({ api, tokens: collAddresses, owner: pool})
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Gravita platform",
  start: 1684256400, // Tuesday, May 15, 2023 17:00 GMT
  ethereum: {
    tvl,
  },
};
