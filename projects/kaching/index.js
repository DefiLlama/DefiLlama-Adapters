const ADDRESSES = require('../helper/coreAssets.json');
const { getConnection } = require('../helper/solana');
const { PublicKey } = require('@solana/web3.js');

const FEE_WALLET = 'Eu59ybbXJ2m5TUUqgCAZ5aVdF1U2ar1c76mcQ2xDfGEA';
const USDC = ADDRESSES.solana.USDC;

async function tvl(api) {
  const connection = getConnection();
  const res = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(FEE_WALLET),
    { mint: new PublicKey(USDC) }
  );
  const total = res.value.reduce((sum, { account }) => {
    return sum + BigInt(account.data.parsed.info.tokenAmount.amount);
  }, BigInt(0));
  api.add(USDC, total.toString());
}

module.exports = {
  methodology: "Kaching! allows users to pay using any supported token across supported chains. Kaching! payment abstraction layer swaps and bridges these tokens into USDC on Solana, which powers the pot size, winnings, and payouts. TVL reflects the total USDC held in the protocol's smart contracts, including active lottery pot balances and treasury reserves used for prize payouts.",
  timetravel: false,
  solana: { tvl },
};
