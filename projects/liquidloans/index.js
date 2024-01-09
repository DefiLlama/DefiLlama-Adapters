const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking.js");
const { pool2s } = require("../helper/pool2");

const VAULT_MANAGER_ADDRESS = "0xD79bfb86fA06e8782b401bC0197d92563602D2Ab";
const STAKING_ADDRESS = "0x853F0CD4B0083eDf7cFf5Ad9A296f02Ffb71C995";
const LOAN_ADDRESS = "0x9159f1D2a9f51998Fc9Ab03fbd8f265ab14A1b3B"

const USDL_ADDRESS = "0x0deed1486bc52aa0d3e6f8849cec5add6598a162";
const STABILITY_POOL = "0x7bFD406632483ad00c6EdF655E04De91A96f84bc";

async function tvl(timestamp, block, chainBlocks, { api }) {

  const systemCollateral = await api.call({
    abi: 'function getEntireSystemColl() view returns (uint256)',
    target: VAULT_MANAGER_ADDRESS
  });

  return api.add(ADDRESSES.pulse.WPLS, systemCollateral)
}

module.exports = {
  timetravel: true,
  start : 18971003,
  pulse: {
    tvl,
    staking: staking(STAKING_ADDRESS, LOAN_ADDRESS, "pulse"),
    pool2: staking(STABILITY_POOL, USDL_ADDRESS, "pulse")
  },
};