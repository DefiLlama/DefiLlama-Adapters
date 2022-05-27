const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { stakingPricedLP, stakingUnknownPricedLP } = require("../helper/staking");

const GLINT_TOKEN = "0xcd3B51D98478D53F4515A306bE565c6EebeF1D58"
const SHARE_CONTRACT = "0x4204cAd97732282d261FbB7088e07557810A6408"
const GLINT_GLMR_LP = "0x99588867e817023162F4d4829995299054a5fC57"


module.exports = {
  misrepresentedTokens: true,
  timetravel: true,
  incentivized: true,
  methodology:
    "Factory address (0x985BcA32293A7A496300a48081947321177a86FD) is used to find the LP pairs. TVL is equal to the liquidity on the AMM & Staking balance is equal to the amount of GLINT staked within the SHARE token contract(0x4204cAd97732282d261FbB7088e07557810A6408)",
  moonbeam: {
    tvl: calculateUsdUniTvl(
      "0x985BcA32293A7A496300a48081947321177a86FD",
      "moonbeam",
      "0xAcc15dC74880C9944775448304B263D191c6077F",
      [
        "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b", //usdc
        "0xcd3B51D98478D53F4515A306bE565c6EebeF1D58", //glint
        "0xa649325aa7c5093d12d6f98eb4378deae68ce23f", //busd
        "0xc9baa8cfdde8e328787e29b4b078abf2dadc2055", //bnb
      ],
      "moonbeam"
    ),
    staking: stakingPricedLP(SHARE_CONTRACT, GLINT_TOKEN, "moonbeam", GLINT_GLMR_LP, "moonbeam")
  },
};