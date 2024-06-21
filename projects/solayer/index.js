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
        ['5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm', 'GF8jvNGY44tnCfhnzdoSUBpgfog9YnLc6BRBCnt8j9do']
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
