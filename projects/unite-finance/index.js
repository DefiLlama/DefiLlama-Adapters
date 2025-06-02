const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const ushareTokenAddress = "0xd0105cff72a89f6ff0bd47e1209bf4bdfb9dea8a";
const ushareRewardPoolAddress = "0xe3F4E2936F0Ac4104Bd6a58bEbd29e49437710Fe";
const boardroomAddress = "0x68BeEc29183464e2C80Aa9B362db8b0c0eB826bd";
const chain = 'harmony'

const OneLPs = [
  "0xa0377f9fd3de5dfefec34ae4807e9f2b9c56d534", // uniteOneLpAddress
  "0x6372d14d29f07173f4e51bb664a4342b4a4da9e8", //ushareOneLpAddress
];

const uDexLPs = [
  "0xeE2208256800398424a45Fe9F135AD0b60DeAE0C", // uniteOneLpAddress
  "0xe302A970E80094a3abB820Eda275FAC5848b5bdA", //ushareOneLpAddress
]
const getReservesABI = 'function getReserves() view returns (uint256 _reserve0, uint256 _reserve1)'

async function OnePool2(api) {
  await sumTokens2({ owner: ushareRewardPoolAddress, tokens: OneLPs, resolveLP: true, api, })

  await sumTokens2({
    api, owner: ushareRewardPoolAddress, tokens: uDexLPs, resolveLP: true, abis: {
      getReservesABI,
    }
  })
}

module.exports = {
  methodology: "Pool2 deposits consist of UNITE/ONE and USHARE/ONE LP tokens deposits while the staking TVL consists of the TSHARES tokens locked within the Boardroom contract(0x68BeEc29183464e2C80Aa9B362db8b0c0eB826bd).",
  harmony: {
    tvl: async () => ({}),
    pool2: OnePool2,
    staking: staking(boardroomAddress, ushareTokenAddress, chain),
  },
};