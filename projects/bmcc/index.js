const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const token = "0xb6D8EE99D5d6cfe7D80b666e6fF5e74e3f72756b";
// const omg = "0x1457438D5326a54ceE5b9398d9171eF8E0BC2DF7";

const stakingContracts = [
  // stakingContract1 =
  "0xD5DBAeb18943ed04CD84Cd3378D67ea94Da0F043",
  // stakingContract2 =
  "0xf7b95c668a31eb448bc4dea5e48a0efbef2fb63b",
  // Lottery
  "0x74ec16b956678e337b88099b7bD0a234e79F60EF",
];

const lockedContracts = [
  //masterchef
  "0xAf3346DE11b838c4ea0D8E369486eB9BACeEEb02",
  "0x65C9DaFddA01e1C81C671Dc20ec0c6341Fe3085e",
  "0x0c89c0407775dd89b12918b9c0aa42bf96518820",
  "0xa36037dC26C5C02e864eBA969A312320E6487269",
];

const bmccLP = [
  "0x9cef33639c75DD023a90A8ae290C2b51D1C44716",
  "0x71810Ae9914e52718965D65cE303E652C08aE25B",
  "0xbAaf55b067c4240C4F7b2665Bf61Dd97A092BD65",
  "0x891D48D1261B2890773fE9407B57A965eCd80740",
  "0x35775a34Cb44805421429d77d6c6C4f90D43daa5",
];

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: async () => ({}),
    staking: stakings(stakingContracts, token),
    pool2: pool2s(lockedContracts, bmccLP),
  },
  methodology: "Counts liquidty on the staking and pool2s",
};
