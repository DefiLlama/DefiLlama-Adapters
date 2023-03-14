const { staking } = require("../helper/staking")
const { pool2 } = require("../helper/pool2")
const { tvl } = require("./helper/index")

const JPEG = "0xe80c0cd204d654cebe8dd64a4857cab6be8345a3"
const JPEG_WETH_SLP = "0xdb06a76733528761eda47d356647297bc35a98bd"
const staking_contract = "0x3eed641562ac83526d7941e4326559e7b607556b"

module.exports = {
  methodology: `Counts the floor value of all NFTs supplied in the protocol vaults`,
  ethereum: {
    tvl,
    staking: staking(staking_contract, JPEG, "ethereum"),
    pool2: pool2(staking_contract, JPEG_WETH_SLP, "ethereum"),
  },
  hallmarks: [
    [1666003500, "pETH borrows"],
    [1669551000, "JPEG LTV boost"],
    [1670518800, "APE staking"],
    [1674669600, "Autoglyphs & Fidenza support"],
  ]
}
