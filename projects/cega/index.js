const { Program } = require("@project-serum/anchor");
const { getProvider, transformBalances, sumTokens2, getTokenBalance } = require("../helper/solana");
const { sumTokens2: ethSumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const idl = require("./idl.json");

const vaultMintAuthority = '4nhbsUdKEwVQXuYDotgdQHoMWW83GvjXENwLsf9QrRJT'
const usdcTokenSpl = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const ercCoinGeckoMap = {
  'usd-coin': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase(),
};

async function borrowed() {
  const provider = getProvider();
  const programId = "3HUeooitcfKX1TSCx2xEpg2W31n6Qfmizu7nnbaEWYzs";
  const program = new Program(idl, programId, provider);
  const accounts = await program.account.vault.all();
  const balances = {};
  accounts.forEach(({ account: i }) => {
    if (Buffer.from(i.productName).toString().trim().includes("test")) return;
    sdk.util.sumSingleBalance(balances, i.underlyingMint.toString(), +i.underlyingAmount );
  });
  const usdcBalance = await getTokenBalance(usdcTokenSpl, vaultMintAuthority)
  sdk.util.sumSingleBalance(balances, usdcTokenSpl, -1 * usdcBalance);
  return transformBalances({ tokenBalances: balances });
}

async function tvl() {
  const collateralBalances = await ethSumTokens2({
    tokens: [ercCoinGeckoMap['usd-coin']],
    owners: [
      // MMs
      '0xBdaF8c2BAA14f322e1429Ae3869B005590Ea1FF8',
      '0x0fEcA1Ff36AbA721BAEd6C6248b6745C88AF1dDF',
      '0x1d14E27221F1b3c690Fc3cced827bEE4892d0698',
      '0x60daD1DF74F20fd6d6C07e6FC6153078Cd14a57c',
      '0xC6589ad1eed78c50f28249D743A585f7053e7D2C',
    ],
  });

  return sumTokens2({ balances: collateralBalances, owner: vaultMintAuthority, tokens: [usdcTokenSpl]});
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
};
