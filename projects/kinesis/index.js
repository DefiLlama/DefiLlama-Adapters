/*==================================================
  Modules
  ==================================================*/
const axios = require("axios");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
// const {
//   transformEvmosAddress
// } = require("../helper/portedTokens");
const { getChainTransform } = require("../helper/portedTokens");

/*** Arbitrum Addresses ***/
const poolAddresses_evmos = [
  //NomadBasePoolAddress
  "0x49b97224655AaD13832296b8f6185231AFB8aaCc",
  //CelerBasePool
  "0xbBD5a7AE45a484BD8dAbdfeeeb33E4b859D2c95C",
  //GravityBasePool
  "0xc3f87b7841aE962557d17010b285f8BC3C3d4408",
  // DAI Base Pool
  "0xbB3c0ea4Df6C9cd7D0734bb4952D8F27a0361a21",
  // USDC Base Pool
  "0x735cad6e573a1963AC381d86bC06a8976BF8F8a6",
  // USDT Base Pool
  "0x81f47A9BEE24c48DB0D6aCC8D22446F2aBeeFF26",
];

// Bridged Nomad Stablecoins
const madUSDC = "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82";
const madUSDT = "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e";
const FRAX = "0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8";

// Bridged Celer Stablecoins
const ceDAI = "0x940dAAbA3F713abFabD79CdD991466fe698CBe54";
const ceUSDC = "0xe46910336479F254723710D57e7b683F3315b22B";
const ceUSDT = "0xb72A7567847abA28A2819B855D7fE679D4f59846";

// Bridged Axelar Stablecoins
const axlDAI = "0x4A2a90D444DbB7163B5861b772f882BbA394Ca67";
const axlUSDC = "0x15C3Eb3B621d1Bff62CbA1c9536B7c1AE9149b57";
const axlUSDT = "0xe01C6D4987Fc8dCE22988DADa92d56dA701d0Fe0";

// Bridged Gravity Stablecoins
const gravDAI = "0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75";
const gravUSDC = "0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687";
const gravUSDT = "0xecEEEfCEE421D8062EF8d6b4D814efe4dc898265";

async function tvl(timestamp, chainBlocks) {
  const balances = {};
  const transformAddress = await getChainTransform("evmos");
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [madUSDC, false],
      [madUSDT, false],
      [axlDAI, false],
      [axlUSDC, false],
      [axlUSDT, false],
      [ceDAI, false],
      [ceUSDC, false],
      [ceUSDT, false],
      [gravDAI, false],
      [gravUSDC, false],
      [gravUSDT, false],
      [FRAX, false],
    ],
    poolAddresses_evmos,
    chainBlocks["evmos"],
    "evmos",
    transformAddress
  );
  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  misrepresentedTokens: true,
  evmos: {
    tvl,
  },
  methodology:
    "Counts as TVL all the Assets deposited on EVMOS through different Pool Contracts",
};
