const ADDRESSES = require('../helper/coreAssets.json')
const { stakings } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const BTCST = "0x78650B139471520656b9E7aA7A5e9276814a38e9";

const vaultContracts = [
  // Live Vaults
  "0x18a144B11feE170230177a481Ba5C2532c0279BD",
  // Finezhed Vaults
  "0xeA17a97705BB74b2c6270830943b7663890D7ceB",
  // BTCST_BTC vault
  "0x216944bAf1182e49252223E78B783fE7d5a02223",
  // BTCST_BTCST Vault
  "0xDC06E57f3987feDdA1567b49791e78B4712E8A28",
  // stake sigmaBitcoin Vault
  "0x68C59C11601BcC6bc515137aD8063382446cBA77",
  // stake sigmaDogecoin Vault
  "0xb94B8e65FD03a7C5cB5bC39C604563ab8F800d21",
];

const listOfTokens = [
  //BTCB
  ADDRESSES.bsc.BTCB,
  //sigmaBTC
  "0x2cd1075682b0fccaadd0ca629e138e64015ba11c",
  //sigmaDOGE
  "0xe550a593d09fbc8dcd557b5c88cea6946a8b404a",
  //DOGE
  "0xba2ae424d960c26247dd6c32edc70b295c744c43",
];

async function bscTvl(chainBlocks) {
  const balances = {};

  const transformAddress = i => `bsc:${i}`;
  for (const token of listOfTokens) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      vaultContracts,
      chainBlocks["bsc"],
      "bsc",
      transformAddress
    );
  }

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: stakings(vaultContracts, BTCST),
    tvl: bscTvl,
  },
  methodology: "Counts liquidty on all the Vaults through their Contracts",
};
