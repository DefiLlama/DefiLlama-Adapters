const { sumTokensExport } = require('../helper/unknownTokens');

const KAST_LP = "0x821dd423c744cAa452C0Ae1651a9388009efbE5b";

const WKAVA = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";
const KAVASTARTER = "0x32a57dCa514Cc601d3DDEe974f57Db9Dc2CfE83b";

const POL_Pool_One = "0x12450E12A7eC069b51b46C92Ac122D90DbD9A99D";
const POL_Pool_Two = "0x9aedc0D09E0Ede60Ba5B5F969a955937af024c44";
const POL_Pool_Three = "0x486F6f8cF46EC5CC584ec3f08C494E55a8484111";

module.exports = {
  kava: {
    tvl: sumTokensExport({ owners: [POL_Pool_One, POL_Pool_Two], tokens: [WKAVA] }),
    staking: sumTokensExport({ owner: POL_Pool_Three, tokens: [KAVASTARTER], lps: [KAST_LP], useDefaultCoreAssets: true, })
  }
};
