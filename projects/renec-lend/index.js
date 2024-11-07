const { sumTokens2, decodeAccount, getMultipleAccounts, getConnection, } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const RENEC_LEND_SOLANA_PROGRAM_ID = new PublicKey("9L193MV4yakKcgNT2tN4Kvf1ypn9c1sVMvsRn1Amw2Au");

async function borrowed(api) {
  const connection = await getConnection();
  const reserves = await connection.getProgramAccounts(
    RENEC_LEND_SOLANA_PROGRAM_ID,
    {
      filters: [{
        dataSize: 619,
      }],
    }
  );
  const reserveAddresses = reserves.map((account) => account.pubkey.toBase58());

  const infos = await getMultipleAccounts(reserveAddresses)
  infos.forEach(i => {
    const decoded = decodeAccount('reserve', i);
    if (decoded === null) return;
    const { info: { liquidity } } = decoded;
    const amount = liquidity.borrowedAmountWads.toString() / 1e18
    api.add(liquidity.mintPubkey.toString(), amount)
  })
}

async function tvl() {
  const connection = await getConnection();
  const marketAccounts = await connection.getProgramAccounts(
    RENEC_LEND_SOLANA_PROGRAM_ID,
    {
      filters: [{
        dataSize: 290,
      }],
    }
  );
  const marketAuthorities = marketAccounts.map((account) => PublicKey.findProgramAddressSync([account.pubkey.toBytes()], RENEC_LEND_SOLANA_PROGRAM_ID)[0]);
  return sumTokens2({ owners: marketAuthorities });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
  hallmarks: [
    [1697414400, "Reneclend launch on renec mainnet"],
    [1694217600, "Reneclend launch on solana mainnet"],
    [1696032000, "Release REL token"],
  ],
};

