const { PublicKey } = require("@solana/web3.js");
const { sumTokens2, getProvider } = require("../helper/solana");
const ADDRESSES = require('../helper/coreAssets.json');
const { Program } = require("@coral-xyz/anchor");

module.exports = {
  avax: { tvl: avaxTvl },
  solana: { tvl: tvlSolana },
  methodology: 'Track the avax & sol locked in the bonding curves'
}

const AVAX_FACTORY = "0x501ee2D4AA611C906F785e10cC868e145183FCE4";

const SOLANA_FACTORY = "JoeaRXgtME3jAoz5WuFXGEndfv4NPH9nBxsLq44hk9J";

async function avaxTvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'getMarketsLength', itemAbi: 'getMarketAt', target: AVAX_FACTORY })
  return api.sumTokens({ owners: pools, tokens: [ADDRESSES.avax.WAVAX] })
}

async function tvlSolana(api) {

  const programId = new PublicKey(SOLANA_FACTORY);
  const provider = getProvider(api.chain);
  const idl = await Program.fetchIdl(programId, provider)
  // idl's address maybe wrong, force update idl address
  idl.address = programId;
  const program = new Program(idl, provider)

  const markets = await program.account.market.all()
  const tokensAndOwners = markets.map(account => [account.account.quoteTokenMint, account.publicKey])
  return sumTokens2({ api, tokensAndOwners, computeTokenAccount: true, allowError: true, })
}