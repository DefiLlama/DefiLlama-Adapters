const { staking } = require("../helper/staking")
const { pool2 } = require("../helper/pool2")
const { getTVL, getTreasury } = require("./helper/index")

const JPEG = "0xe80c0cd204d654cebe8dd64a4857cab6be8345a3"
const JPEG_WETH_SLP = "0xdb06a76733528761eda47d356647297bc35a98bd"
const staking_contract = "0x3eed641562ac83526d7941e4326559e7b607556b"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  await getTVL(balances, "ethereum", timestamp, chainBlocks);
  return balances;
}

async function treasury(timestamp, block, chainBlocks) {
  const balances = {};
  await getTreasury(balances, "ethereum", timestamp, chainBlocks);
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the floor value of all NFTs supplied in the protocol vaults`,
  ethereum: {
    tvl,
    treasury,
    staking: staking(staking_contract, JPEG, "ethereum"),
    pool2: pool2(staking_contract, JPEG_WETH_SLP, "ethereum"),
  }
}
