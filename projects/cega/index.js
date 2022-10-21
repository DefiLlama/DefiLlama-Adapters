const { Program } = require("@project-serum/anchor");
const { getProvider, transformBalances, sumTokens2, getTokenBalance } = require("../helper/solana");
const sdk = require("@defillama/sdk");
const idl = require("./idl.json");

const vaultMintAuthority = '4nhbsUdKEwVQXuYDotgdQHoMWW83GvjXENwLsf9QrRJT'
const usdcToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

async function borrowed() {
  const provider = getProvider();
  const programId = "3HUeooitcfKX1TSCx2xEpg2W31n6Qfmizu7nnbaEWYzs";
  const program = new Program(idl, programId, provider);
  const accounts = await program.account.vault.all();
  const balances = {};
  accounts.forEach(({ account: i }) => {
    if (Buffer.from(i.productName).toString().trim().includes("test")) return;
    sdk.util.sumSingleBalance(balances, i.underlyingMint.toString(), +i.underlyingAmount / 1e6);
  });
  const usdcBalance = await getTokenBalance(usdcToken, vaultMintAuthority)
  sdk.util.sumSingleBalance(balances, usdcToken, -1 * usdcBalance);
  return transformBalances({ tokenBalances: balances });
}

async function tvl() {
  return sumTokens2({ owner: vaultMintAuthority, tokens: [usdcToken]})
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
};
