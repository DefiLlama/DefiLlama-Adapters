const { staking } = require("../helper/staking");

module.exports = {
  methodology: "TVL comes from the Staking Vaults",
  ethereum: {
    tvl: () => ({}),
    staking: staking([
      "0x7AabE771aCcAa3F54a1B7c05d65c6E55d0Cd0Af6",
      "0x88062FE2751f3D5cEC18F6113A532A611632ae79",
      "0x8DBA1f564458dd46283ca3a4CDf6CA019963aB42",
    ], "0x1495bc9e44Af1F8BCB62278D2bEC4540cF0C05ea"),
  },
}
