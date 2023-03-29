const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { compoundExports } = require("../helper/compound");

const comptroller = "0xE7E304F136c054Ee71199Efa6E26E8b0DAe242F3";
const polygonComptroller = "0x8f85ee1c0a96734cb76870106dd9c016db6de09a"
const avaxComptroller = "0x8f85ee1c0a96734cb76870106dd9c016db6de09a"
const dcComptroller = "0xA65722af4957CeF481Edb4cB255f804DD36E8aDc"

const vaultStakingContract_BNB = "0x9aFc9877b1621e414E907F13A8d3ED9511bE03de";
const ATL = "0x1fD991fb6c3102873ba68a4e6e6a87B3a5c10271";

const lpVaultStakingContract_BNB = "0xC7A5Bb6FCd603309D7a010de44dcBDe26fD45B58";
const ALT_BUSD_CakeLP_BNB = "0xaa40dc3ec6ad76db3254b54443c4531e3dfe6bdb";

module.exports = {
  misrepresentedTokens: true,
  timetravel: true,
  doublecounted: false,
  bsc: {
    pool2: pool2(lpVaultStakingContract_BNB, ALT_BUSD_CakeLP_BNB, "bsc"),
    staking: staking(vaultStakingContract_BNB, ATL, "bsc"),
    ...compoundExports(comptroller,
      "bsc",
      "0x5A9A90983A369b6bB8F062f0AFe6219Ac01caF63",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    ),
  },
  polygon: compoundExports(polygonComptroller,
    "polygon",
    "0xa65722af4957cef481edb4cb255f804dd36e8adc",
    "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
  ),
  avax: compoundExports(avaxComptroller,
    "avax",
    "0x6bd2154fbc086cb43411966e0e72584196ccd065",
    "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
  ),
  dogechain: compoundExports(dcComptroller,
    "dogechain",
    "0xbc46Dc817ce983CfD1B36cBc599031aCBEc2FDfe",
    "0xb7ddc6414bf4f5515b52d8bdd69973ae205ff101"
  ),
  methodology:
    "TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
};
