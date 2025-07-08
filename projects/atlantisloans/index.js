const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { compoundExports } = require("../helper/compound");

const avaxComptroller = "0x8f85ee1c0a96734cb76870106dd9c016db6de09a"
const dcComptroller = "0xA65722af4957CeF481Edb4cB255f804DD36E8aDc"

const vaultStakingContract_BNB = "0x9aFc9877b1621e414E907F13A8d3ED9511bE03de";
const ATL = "0x1fD991fb6c3102873ba68a4e6e6a87B3a5c10271";

const lpVaultStakingContract_BNB = "0xC7A5Bb6FCd603309D7a010de44dcBDe26fD45B58";
const ALT_BUSD_CakeLP_BNB = "0xaa40dc3ec6ad76db3254b54443c4531e3dfe6bdb";

module.exports = {
  misrepresentedTokens: true,
      bsc: {
    pool2: pool2(lpVaultStakingContract_BNB, ALT_BUSD_CakeLP_BNB),
    staking: staking(vaultStakingContract_BNB, ATL),
    tvl: async () => ({}),
  },
  polygon: {
    tvl: async () => ({}),
  },
  avax: compoundExports(avaxComptroller,
    "0x6bd2154fbc086cb43411966e0e72584196ccd065",
    ADDRESSES.avax.WAVAX
  ),
  dogechain: compoundExports(dcComptroller,
    "0xbc46Dc817ce983CfD1B36cBc599031aCBEc2FDfe",
    ADDRESSES.dogechain.WWDOGE
  ),
  hallmarks: [
    ['2023-04-01', 'Team stops all comms, stole funds (?)'],
    // ['2023-06-10', 'Governance Attack'],
  ],
  methodology:
    "TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
};
