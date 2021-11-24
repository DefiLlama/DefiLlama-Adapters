const sdk = require("@defillama/sdk");
const BigNumber = require('bignumber.js')
const erc20 = require("../helper/abis/erc20.json");
const { pool2s } = require("../helper/pool2");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");

const stakingContracts = [
  //pEVRT
  "0x451D00AF6E751537a9A2cFF40CdFB1119cd1fA7d",
  //pEVRT Farm
  "0x13B2e894E3e7D60c0E084ab5Cc47552d7cfE40C4",
];
const EVRT = "0x3ACa5545e76746A3Fe13eA66B24BC0eBcC51E6b4";
const pEVRT = "0x451D00AF6E751537a9A2cFF40CdFB1119cd1fA7d";

const pool2Contracts = [
  //EVRT/LYD Contract
  "0xE34E22bC053D529c649EA3808Bbc1caA43687cdb",
  //EVRT/AVAX Contract
  "0xD81Bbd31D6dA2b0D52f8c02B276940Be9423c1d3",
  //EVRT/AVAX Contract
  "0x6f34201abc4fFAA2d3C86563Bc603bc3c0BD8f7f",
  //EVRT/AVAX Contract
  "0xbA6B26AE795C68770A86C6D020e952B60a48da5f",
];
const pool2Lps = [
  //EVRT/LYD Lydia-LP
  "0x3b4656d0e149686fad8d1568898beed1e2d16998",
  //EVRT/AVAX Lydia-LP
  "0x26bbbf5104f99dd1d6e61ff54980e78edcb0ba29",
  //EVRT/AVAX JLP
  "0xfda31e6c2bae47f9e7bd9f42933ace1d28ff537b",
  //EVRT/AVAX PGL
  "0x7ece5fc08050f8007188897c578483aabd953bc2",
];

async function Staking(chainBlocks) {
  const balances = {};

  let transformAddress = await transformAvaxAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    [[EVRT, false]],
    stakingContracts,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  const balancepEVRT = (
    await sdk.api.abi.call({
      abi: erc20.balanceOf,
      target: pEVRT,
      params: stakingContracts[1],
      chain: "avax",
      block: chainBlocks["avax"],
    })
  ).output;

  const totalBalance = BigNumber(balancepEVRT * 1.3403).toFixed(0)

  sdk.util.sumSingleBalance(balances, `avax:${EVRT}`, totalBalance);

  return balances;
}

module.exports = {
  avax: {
    staking: Staking,
    pool2: pool2s(pool2Contracts, pool2Lps, "avax"),
    tvl: async () => ({}),
  },
  methodology:
    "Counts liquidity on the Farms through their Contracts",
};
