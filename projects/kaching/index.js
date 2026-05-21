const ADDRESSES = require('../helper/coreAssets.json');
const { getConnection } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');
const PROGRAM_ID = 'Dr9ci9hAYPWd5tmDQysroPp74BcMLh84uh34ZUjVrh35';
const FEE_WALLET = 'Eu59ybbXJ2m5TUUqgCAZ5aVdF1U2ar1c76mcQ2xDfGEA';
const USDC = ADDRESSES.solana.USDC;


async function getUsdcBalance(connection, owner) {
  const res = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(owner),
    { mint: new PublicKey(USDC) }
  );
  return res.value.reduce((sum, { account }) => {
    return sum + BigInt(account.data.parsed.info.tokenAmount.amount);
  }, BigInt(0));
}

async function tvl(api) {
  const connection = getConnection();

  // On-chain balances already cover all USDC held by the protocol
  const [programBalance, feeWalletBalance] = await Promise.all([
    getUsdcBalance(connection, PROGRAM_ID),
    getUsdcBalance(connection, FEE_WALLET),
  ]);

  api.add(USDC, (programBalance + feeWalletBalance).toString());
}

module.exports = {
  methodology: "Kaching! allows users to pay using any supported token across supported chains. Kaching! payment abstraction layer swaps and bridges these tokens into USDC on Solana, which powers the pot size, winnings, and payouts. TVL reflects the total USDC held in the protocol's smart contracts, including active lottery pot balances and treasury reserves used for prize payouts.",
  timetravel: false,
  solana: { tvl },
};
