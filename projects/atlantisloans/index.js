const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { getCompoundV2Tvl } = require("../helper/compound");

const comptroller = "0xE7E304F136c054Ee71199Efa6E26E8b0DAe242F3";

const vaultStakingContract = "0x9aFc9877b1621e414E907F13A8d3ED9511bE03de";
const ATL = "0x1fD991fb6c3102873ba68a4e6e6a87B3a5c10271";

const lpVaultStakingContract = "0xC7A5Bb6FCd603309D7a010de44dcBDe26fD45B58";
const ALT_BUSD_CakeLP = "0xaa40dc3ec6ad76db3254b54443c4531e3dfe6bdb";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    pool2: pool2(lpVaultStakingContract, ALT_BUSD_CakeLP, "bsc"),
    staking: staking(vaultStakingContract, ATL, "bsc"),
    tvl: getCompoundV2Tvl(
      comptroller,
      "bsc",
      addr=>`bsc:${addr}`,
      "0x5A9A90983A369b6bB8F062f0AFe6219Ac01caF63",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    ),
  },
  methodology:
    "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
};
