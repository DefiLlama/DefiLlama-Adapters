const { stakings, staking } = require("./helper/staking.js");
const { pool2 } = require("./helper/pool2.js");

module.exports = {
  bsc: {
    tvl: () => ({}),
    pool2: pool2(['0xdad49e63f97c967955975490a432de3796c699e6','0xa5f8c5dbd5f286960b9d90548680ae5ebff07652'], '0x8FA59693458289914dB0097F5F366d771B7a7C3F'),
    staking: stakings(
      [
        "0xdad49e63f97c967955975490a432de3796c699e6",
        "0xf8c1bA88F1E4aeD152F945F1Df2a8fdc36127B5f",
        "0x3bD6a582698ECCf6822dB08141818A1a8512c68D",
        "0x5E7Eb57B163b78e93608E773e0F4a88A55d7C28F",
      ],
      "0x3203c9e46ca618c8c1ce5dc67e7e9d75f5da2377",
    ),
  },
};
