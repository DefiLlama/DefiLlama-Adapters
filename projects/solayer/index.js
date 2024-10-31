const { sumTokens2, getConnection } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

async function tvl() {
  const connection = getConnection();
  const [account, lst] = await Promise.all([
    connection.getAccountInfo(new PublicKey('po1osKDWYF9oiVEGmzKA4eTs8eMveFRMox3bUKazGN2')),
    sumTokens2({
      tokensAndOwners: [
        ['J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn', 'GgTE2exWZ36Q82FoVgEEzEHYCfsbGjm3P6zRfx3hLUv4'],
        ['mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So', 'E9LmYVKU5oyjWs9Zmzv9ji8NkzhJxJQbUEH3FWDKZt8D'],
        ['bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1', '2DRZbbse5b5souvMQkifpS8CRBsDeLt6a9xDqqVJvmdw'],
        ['5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm', 'GF8jvNGY44tnCfhnzdoSUBpgfog9YnLc6BRBCnt8j9do'],
        ['HUBsveNpjo5pWqNkH57QzxjQASdTVXcSK7bVKTSZtcSX', '49EXLuCxc2ArgFfpJBeuci6DgULxMzrETAHpAGvsFBf1'],
        ['Gwa3a4VJbAyorLhn6TEeWLbQ4tWyup4E6oL3WjAga7tx', '2DriEN733SMxEzqDBVSGwev7KwcdHPXVy65sw9u5mR14'],
        ['he1iusmfkpAdwvxLNGV8Y1iSbj4rUy6yMhEA3fotn9A', '2DriEN733SMxEzqDBVSGwev7KwcdHPXVy65sw9u5mR14'],
        ['Bybit2vBJGhPF52GBdNaQfUJ6ZpThSgHBobjWZpLPb4B', 'FXz4ToVamCcPphADQ4bXvRuk15HP63r6hsKycojVEoT8'],
        ['BNso1VUJnh4zcfpZa6986Ea66P6TCp59hvtNJ8b1X85', '7RJPqA2b4SicEzLSyUVhGZUdH2rGrTaXV1t7Z4ga2Kpg'],
        // Add sUSD vault tracking
        ['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'FhVcYNEe58SMtxpZGnTu2kpYJrTu2vwCZDGpPLqbd2yG'], // USDC token and vault
        ['4MmJVdwYN8LwvbGeCowYjSx7KoEi6BJWg8XXnW4fDDp6', 'FhVcYNEe58SMtxpZGnTu2kpYJrTu2vwCZDGpPLqbd2yG'], // TBILL token and vault
      ],
    })
  ]);

  return {
    solana: Number(account.data.readBigUint64LE(258)) / 1e9,
    ...lst
  };
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing all re-staked assets.",
  solana: { tvl },
};
