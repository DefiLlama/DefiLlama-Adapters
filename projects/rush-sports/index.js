const { PublicKey } = require('@solana/web3.js');
const { sumTokens2 } = require('../helper/solana');

const BANKROLL_PROGRAM_ID = new PublicKey('CAzPCZuaji4ycz4KWtmBirvNeXp3ULCqunJgSMFZX5ar');
const BANKROLL_STATES = [
  'MVe7JbiTAfa1VinJqHTsSWFXpG6Sap68Zc55ZzVb1ns',
];

function bankrollVaultPda(bankrollState) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), new PublicKey(bankrollState).toBuffer()],
    BANKROLL_PROGRAM_ID,
  )[0].toBase58();
}

async function tvl() {
  const solOwners = BANKROLL_STATES.map(bankrollVaultPda);
  return sumTokens2({ solOwners });
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL counts SOL held in Rush Sports bankroll vault PDA(s). Vault PDA(s) are derived as ["vault", bankroll_state] under the bankroll program and back LP liquidity plus in-flight game settlement obligations.',
  solana: { tvl },
};
