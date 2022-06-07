const { staking } = require("../helper/staking")
const { pool2 } = require("../helper/pool2")

const JPEG = "0xe80c0cd204d654cebe8dd64a4857cab6be8345a3"
const JPEG_WETH_SLP = "0xdb06a76733528761eda47d356647297bc35a98bd"
const staking_contract = "0x3eed641562ac83526d7941e4326559e7b607556b"

module.exports = {
  methodology: `TVL for JPEG'd consists of the staking of JPEG and pool2 of the sushi JPEG/WETH LP`, 
  ethereum:{
    tvl: () => ({}),
    staking: staking(staking_contract, JPEG, "ethereum"), 
    pool2: pool2(staking_contract, JPEG_WETH_SLP, "ethereum"), 
  }
}