const { sumTokens2, decodeAccount, getMultipleAccounts, getConnection, } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const RENEC_LEND_SOLANA_PROGRAM_ID = new PublicKey("9L193MV4yakKcgNT2tN4Kvf1ypn9c1sVMvsRn1Amw2Au");
const RENEC_LEND_RENEC_PROGRAM_ID = new PublicKey("AqR1WSUwNeVsz66ayH2J8iTyiGMgouRwPqzzMaxx49ba");

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

async function borrowedRenec(api) {
  const connection = await getConnection('renec');
  const reserves = await connection.getProgramAccounts(
    RENEC_LEND_RENEC_PROGRAM_ID,
    {
      filters: [{
        dataSize: 619,
      }],
    }
  );
  const reserveAddresses = reserves.map((account) => account.pubkey.toBase58());

  const infos = await getMultipleAccounts(reserveAddresses, 'renec')
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

async function tvlRenec() {
  const connection = await getConnection('renec');
  const marketAccounts = await connection.getProgramAccounts(
    RENEC_LEND_RENEC_PROGRAM_ID,
    {
      filters: [{
        dataSize: 290,
      }],
    }
  );
  const marketAuthorities = marketAccounts.map((account) => PublicKey.findProgramAddressSync([account.pubkey.toBytes()], RENEC_LEND_RENEC_PROGRAM_ID)[0]);
  return sumTokens2({ owners: marketAuthorities, chain: 'renec' });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    borrowed,
  },
  renec: {
    tvl: tvlRenec,
    borrowed: borrowedRenec,
  },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
  hallmarks: [
    [1697414400, "Reneclend launch on renec mainnet"],
    [1694217600, "Reneclend launch on solana mainnet"],
    [1696032000, "Release REL token"],
  ],
};

