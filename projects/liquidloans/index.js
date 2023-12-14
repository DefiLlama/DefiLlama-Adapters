const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js");

const PLS_ADDRESS = ADDRESSES.null;
// VaultManager holds total system collateral (deposited PLS)
const VAULT_MANAGER_ADDRESS = "0xD79bfb86fA06e8782b401bC0197d92563602D2Ab";
const STAKING_ADDRESS = "0x853F0CD4B0083eDf7cFf5Ad9A296f02Ffb71C995";
const LOAN_ADDRESS = "0x9159f1D2a9f51998Fc9Ab03fbd8f265ab14A1b3B"

async function tvl(_, block) {

  const vaultPlsTvl = (
    await sdk.api.abi.call({
      target: VAULT_MANAGER_ADDRESS,
      abi: "uint256:getEntireSystemColl",
      block,
    })
  ).output;

  return {
    [PLS_ADDRESS]: vaultPlsTvl,
  };
}

module.exports = {
  timetravel: true,
  start: 18971008,
  pulse: {
    tvl,
    staking: staking(STAKING_ADDRESS, LOAN_ADDRESS, "pulse")
  }
  
};
