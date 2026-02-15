const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const idl = require("./idl.json");

const PROGRAM_ID = "94jkbjHAz6oVCsbsDKpeBRZZYvhm2Hg2epNDihLmb4nN";

async function tvl(api) {
  const provider = getProvider(api.chain);
  const program = new Program(idl, PROGRAM_ID, provider);
  const pools = await program.account.pool.all();
  const tokenAccounts = pools.flatMap(({ account }) => [
    account.tokenAVault,
    account.tokenBVault,
  ]);
  return sumTokens2({ tokenAccounts, api });
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  pyra: { tvl },
  methodology:
    "TVL is calculated by summing token balances in all Pyra DEX (DAMM v2) liquidity pool vaults.",
};
