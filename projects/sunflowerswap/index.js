const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const SUNF_TOKEN = "0xE3434D4D7Fa39B9e1a004C0e53fa3b565aEE493D"
const MASTER_CONTRACT = "0x1b9df08EF60800D2B7b8a909589246e18E809797"
const SUNF_GLMR_LP = "0x9E9D22872965b73A9fF44576468f20028e838A18"

module.exports = {
  misrepresentedTokens: true,
  timeTravel: true,
  incentivized: true,
  methodology:
    "Factory address (0x5aec27384DbE84d46C29A20DFeFF09493711CD15) is used to find the LP pairs. TVL is equal to the liquidity on the AMM & Staking balance is equal to the amount of SUNF staked within the SHARE token contract(0x1b9df08EF60800D2B7b8a909589246e18E809797)",
    moonbeam: {
      tvl: calculateUsdUniTvl(
        "0x5aec27384DbE84d46C29A20DFeFF09493711CD15",
        "moonbeam",
        "0xAcc15dC74880C9944775448304B263D191c6077F",
        [
          "0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9", //usdc
          "0xE3434D4D7Fa39B9e1a004C0e53fa3b565aEE493D", //sunf
          "0xa649325aa7c5093d12d6f98eb4378deae68ce23f", //busd
          "0xc9baa8cfdde8e328787e29b4b078abf2dadc2055", //bnb
        ],
        "moonbeam"
      )
    },
};
