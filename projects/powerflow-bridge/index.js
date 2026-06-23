const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs.js");
const { sumTokens2 } = require("../helper/solana.js");

const erc20Contracts = [
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.null,
];

async function solanaTvl() {
  return sumTokens2({
    owner: "Cqv9L3HeevzDQipST26xNR5DBrcRRRqRsg4HTHA1wE9L",
    solOwners: ['Cqv9L3HeevzDQipST26xNR5DBrcRRRqRsg4HTHA1wE9L'],
  });
}

module.exports = {
  methodology: "Counts the tokens locked in the PowerFlow Bridge contracts.",
  titan: {
    tvl: () => ({}),
  },
  ethereum: {
    tvl: sumTokensExport({
      owner: "0x9Be9C79f1d8bC09c5b9A6c312e360227Ddb57230",
      tokens: erc20Contracts,
    }),
  },
  solana: {
    tvl: solanaTvl,
  },
};
