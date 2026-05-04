const BigNumber = require("bignumber.js");
const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs.js");
const { getConnection, sumTokens2 } = require("../helper/solana.js");
const { PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");

const erc20Contracts = [
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  "0x667102BD3413bFEaa3Dffb48fa8288819E480a88", // TKX
];

async function ethereumTvl(api) {
  await sumTokensExport({
    owner: "0x9Be9C79f1d8bC09c5b9A6c312e360227Ddb57230",
    tokens: erc20Contracts,
  })(api);

  const weiAmount = await api.provider.getBalance(
    "0x9Be9C79f1d8bC09c5b9A6c312e360227Ddb57230"
  );
  const ethAmount = new BigNumber(weiAmount)
    .dividedBy(new BigNumber(10).pow(18))
    .toNumber();

  api.addCGToken("ethereum", ethAmount);
}

const SOLANA_TOKENS = [
  "BUhS5coXEt9hcxN3JSpGYUWSKbNo96RsKu52LcMo12rf",
  "7TSCoke2mSZzAtyuRmzANf9virrnyv4xSUeaxUrKkLqw",
  "5pPkhLEJDMFDHUuE1wW5os5YJeyNUDVmih1DKgMFpB38",
];

async function solanaTvl() {
  const balances = await sumTokens2({
    owner: "Cqv9L3HeevzDQipST26xNR5DBrcRRRqRsg4HTHA1wE9L",
    tokens: SOLANA_TOKENS,
    computeTokenAccount: true,
    allowError: true,
  });

  const connection = getConnection();
  const lamportAmount = await connection.getBalance(
    new PublicKey("Cqv9L3HeevzDQipST26xNR5DBrcRRRqRsg4HTHA1wE9L")
  );
  const solAmount = lamportAmount / LAMPORTS_PER_SOL;

  balances["solana"] = solAmount;

  return balances;
}

module.exports = {
  methodology: "Counts the tokens locked in the PowerFlow Bridge contracts.",
  ethereum: {
    tvl: ethereumTvl,
  },
  solana: {
    tvl: solanaTvl,
  },
};
