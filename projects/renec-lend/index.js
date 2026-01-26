const { sumTokens2, decodeAccount, getMultipleAccounts, getConnection, } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const RENEC_LEND_SOLANA_PROGRAM_ID = new PublicKey("9L193MV4yakKcgNT2tN4Kvf1ypn9c1sVMvsRn1Amw2Au");
const RENEC_LEND_RENEC_PROGRAM_ID = new PublicKey("AqR1WSUwNeVsz66ayH2J8iTyiGMgouRwPqzzMaxx49ba");

const getProgram = (api) => api.chain === 'solana' ? RENEC_LEND_SOLANA_PROGRAM_ID : RENEC_LEND_RENEC_PROGRAM_ID;

async function borrowed(api) {
  const connection = await getConnection(api.chain);
  const programId = getProgram(api);
  const reserves = await connection.getProgramAccounts(
    programId,
    {
      filters: [{
        dataSize: 619,
      }],
    }
  );
  const reserveAddresses = reserves.map((account) => account.pubkey.toBase58());

  const infos = await getMultipleAccounts(reserveAddresses, { api })
  infos.forEach(i => {
    const decoded = decodeAccount('reserve', i);
    if (decoded === null) return;
    const { info: { liquidity } } = decoded;
    const amount = liquidity.borrowedAmountWads.toString() / 1e18
    api.add(liquidity.mintPubkey.toString(), amount)
  })
}

async function tvl(api) {
  const connection = await getConnection(api.chain);
  const programId = getProgram(api);

  const marketAccounts = await connection.getProgramAccounts(
    programId,
    {
      filters: [{
        dataSize: 290,
      }],
    }
  );
  const marketAuthorities = marketAccounts.map((account) => PublicKey.findProgramAddressSync([account.pubkey.toBytes()], programId)[0]);
  return sumTokens2({ owners: marketAuthorities, api });
}

module.exports = {
  timetravel: false,
  solana: { tvl, borrowed, },
  renec: { tvl, borrowed, },
  methodology:
    "TVL consists of deposits made to the protocol and like other lending protocols, borrowed tokens are not counted. Coingecko is used to price tokens.",
};

