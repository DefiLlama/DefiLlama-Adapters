const { treasuryExports } = require("../helper/treasury");

const treasury = "0x27A0E8c357fCF2EfA69249461D16BDd2828090DC";
const arbtreasury = "0x5BE13f90cD86a8bb0f0573B550f04b95927F5dc5";

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury,],
    ownTokens: ["0x901e3059Bf118AbC74d917440F0C08FC78eC0Aa6"], // GOA
    resolveLP: true,
  },
  arbitrum: {
    owners: [arbtreasury,],
    ownTokens: ["0x8c6Bd546fB8B53fE371654a0E54D7a5bD484b319"], // GOA
    resolveLP: true,
  },
})