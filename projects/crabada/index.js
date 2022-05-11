const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformAvaxAddress } = require("../helper/portedTokens");

const stakingContract = "0xD2cd7a59Aa8f8FDc68d01b1e8A95747730b927d3";
const CRA = "0xa32608e873f9ddef944b24798db69d80bbb4d1ed";

const treasuryContracts = [
  //mains treasury
  "0x96DD95307295e2f72E6382Fc5130F1A8DB74042C",
  // Breeding fees
  "0x4e57A39Cac2499aBeafd3698F7164eCBFde008eE",
  // Marketplace fees
  "0x49F6fC3f882e2Cd915E38bA377f8e977c11e0F66",
  // Tavern fees
  "0x2BA9033E49EC1aa030fA46DE6d6793983945497E",
];

const lpTokens = [
  [CRA, false],
  ["0xf693248F96Fe03422FEa95aC0aFbBBc4a8FdD172", false], //TUS
  ["0x140CAc5f0e05cBEc857e65353839FddD0D8482C1", true], // WAVAX-CRA JLP
  ["0x565d20BD591b00EAD0C927e4b6D7DD8A33b0B319", true], // WAVAX-TUS JLP
  ["0x21889033414f652f0fD0e0f60a3fc0221d870eE4", true], // CRA-TUS JLP
  ["0x134905461773eF228b66CEBd5E1FF06D7CC79B12", true], // TUS-CRAM JLP
  ["0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", false] // USDC
];

async function Treasury(timestamp, chainBlocks) {
  const balances = {};

  const transformAddress = await transformAvaxAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    lpTokens,
    treasuryContracts,
    chainBlocks["avax"],
    "avax",
    transformAddress
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  avax: {
    treasury: Treasury,
    staking: staking(stakingContract, CRA, "avax"),
    tvl: () =>({}),
  },
  methodology:
  "Counts liquidty of the assets(USDC) deposited through Treasury Contract; also Staking and Treasury parts",
};
