const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumBalancerLps, } = require("../helper/unwrapLPs.js");

const VaultTokens = {
  gOHM: "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1",
  ETH: ADDRESSES.null,
  renBTC: ADDRESSES.fantom.renBTC,
  DPX: "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
  GMX: ADDRESSES.arbitrum.GMX,
  GLP: "0x2f546ad4edd93b956c8999be404cdcafde3e89ae"
}

const FEGLP_ADDRESS = "0x4277f8F2c384827B5273592FF7CeBd9f2C1ac258"

const VSTA_FARMING_ADDRESS = "0x65207da01293C692a37f59D1D9b1624F0f21177c";
const LP_VSTA_ETH_ADDRESS = "0xc61ff48f94d801c1ceface0289085197b5ec44f0";

const VST_FARMING_ADDRESS = "0xB3667b3d1b3D4ed3d451dF68C9C12A686227Bada";
const LP_VST_FRAX_ADDRESS = "0x59bF0545FCa0E5Ad48E13DA269faCD2E8C886Ba4";

// TroveManager holds total system collateral for each individual vaults
const TROVE_MANAGER_ADDRESS = "0x100EC08129e0FD59959df93a8b914944A3BbD5df";



async function tvl(api) {
  const balances = {}
  const calls = Object.values(VaultTokens)
  const output = await api.multiCall({
    calls, target: TROVE_MANAGER_ADDRESS, abi: "function getEntireSystemColl(address _asset) view returns (uint256 entireSystemColl)",
  })

  output.forEach((output, i) => {
    const token = calls[i].toLowerCase()
    if (token.toLowerCase() === VaultTokens.renBTC) output /= 1e10 // fix renBTC balance

    const llamaTokenAddress = token.toLowerCase() === VaultTokens.GLP ? FEGLP_ADDRESS : token // convert sGLP to feGLP address for price api

    sdk.util.sumSingleBalance(balances, llamaTokenAddress, output, api.chain)
  })

  return balances;
}

async function pool2(api) {
  const balances = {}
  await sumBalancerLps(balances, [[LP_VSTA_ETH_ADDRESS, VSTA_FARMING_ADDRESS]], api.block, api.chain);

  const curveBalances = await api.call({ target: VST_FARMING_ADDRESS, abi: "uint256:totalStaked" })
  sdk.util.sumSingleBalance(balances, LP_VST_FRAX_ADDRESS, curveBalances, api.chain)
  return balances;
}

module.exports = {
  arbitrum: {
    tvl,
    pool2,
  },
  start: 1644339600,
    methodology:
    "Total Value Locked includes all stability pools, troves, and vst pairs",
};
