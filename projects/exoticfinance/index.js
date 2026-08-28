const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')
const { PublicKey } = require("@solana/web3.js")


const VAULT_PROGRAM_ID = '4whGbgs4juSkn2Ywobrs5UL8zRhwmgBtMJUW5R8BqRFp';
const USDC_MINT = ADDRESSES.solana.USDC
const INDEX_ARRAY = [0, 1];
const PDA_ENCODING = 'utf8';

function vaultPda() {
  return PublicKey.findProgramAddressSync([
    Buffer.from('vault', PDA_ENCODING),
    new PublicKey(USDC_MINT).toBuffer(),
    Buffer.from(INDEX_ARRAY)
  ], 
  new PublicKey(VAULT_PROGRAM_ID))[0].toString()
}

async function tvl(api) {
  const vault = vaultPda();
  return await sumTokens2({ api, tokenAccounts: [vault] })
}

module.exports = {
  timetravel: false,
  methodology: "Tracks USDC deposited in ExoticFinance liquidity vault",
  solana: { tvl },
}
