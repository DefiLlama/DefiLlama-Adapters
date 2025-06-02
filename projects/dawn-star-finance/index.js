const { unknownTombs } = require('../helper/unknownTokens')

let token = "0x095BC617b36AB227A379550633DFDCBf43f236F6";
let share = "0xf8Eed914a0BAcAF30C13420989bB7C81b75D833A";
const rewardPool = "0xfA9f91a340e2eFA47B67921f8809E98796d1f7F7";
const masonry = "0x00c8Ee42761C95B223676d6Ea59c6b7f6f643A6E";
const pool2LPs = [
  "0xfc48B66b9119f1d5fD7C8e72E7e489a5D6C0EF55",
  "0xe1628A0e5250Fa17271Cef1ED4d892cb32D5ADd4"
];

module.exports = unknownTombs({
  lps: pool2LPs,
  token,
  shares: [share],
  rewardPool,
  masonry: [masonry],
  chain: 'polygon',
  useDefaultCoreAssets: true,
})
