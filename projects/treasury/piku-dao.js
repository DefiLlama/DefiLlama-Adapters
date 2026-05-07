const { nullAddress, treasuryExports } = require("../helper/treasury");

const hotWallet = "0xb7f15d1122c0F91eE77C1172B9EFa4C061952E3C";
const coldWallet = "0x16c4150e22c53eCE02bB70763625DD3d61f1E7E9";
const arma_proxy_address = "0x18da71475c41721934f69c8a91a4e2178a1c32c8";
const coldRewardWallet = "0xA056f4a4213e78890eA6CdAE7567CE9287c97726";
const treasuryWallet = "0x32a605E91Ecc3ab972697E58712f6c9c37cabC1D";


const multiChainOwners = [hotWallet, coldWallet, coldRewardWallet, treasuryWallet, arma_proxy_address];


const PIKU = "0x2E4039E8E31475d65DC00293C366FDBfBBC02DC3";
const SPIKU = "0x5Da17CA137f1128d4be7Ce574bc61f3ac4839Df8";
const USP = "0x098697bA3Fee4eA76294C5d6A466a4e3b3E95FE6";

const BMMF_BASE = "0x50b95509e8fc9cda3860c2ef80308467ab6534cc";
const SUSDAI_PLASMA = "0x0b2b2b2076d95dda7817e785989fe353fe955ef9";
const AUSDT0_PLASMA = "0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948";
const sUSDx_PLASMA = "0x13A099765B34b3aAFedb8698CF7fd418E7730012";
const earnAUSD_MONAD = "0x36eDbF0C834591BFdfCaC0Ef9605528c75c406aA";
const syzUSD_PLASMA = "0xC8A8DF9B210243c55D31c73090F06787aD0A1Bf6";

module.exports = {
  misrepresentedTokens: true,
  ...treasuryExports({
    ethereum: {
      tokens: [nullAddress],
      owners: multiChainOwners,
      ownTokens: [PIKU, SPIKU, USP],
    },
    base: {
      tokens: [nullAddress, BMMF_BASE],
      owners: multiChainOwners,
    },
    arbitrum: {
      tokens: [nullAddress],
      owners: multiChainOwners,
    },
    plasma: {
      tokens: [nullAddress, SUSDAI_PLASMA, AUSDT0_PLASMA, sUSDx_PLASMA, syzUSD_PLASMA],
      owners: multiChainOwners,
    },
    monad: {
      tokens: [nullAddress, earnAUSD_MONAD],
      owners: multiChainOwners,
    },
  }),
};
