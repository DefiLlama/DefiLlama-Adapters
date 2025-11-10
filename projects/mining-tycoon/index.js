// Mining Tycoon - Dual Currency Mining Pool on Solana
// Tracks SOL + GPU token locked in protocol vaults

const { sumTokens2 } = require("../helper/solana");

const ADDRESSES = {
  SOL_VAULT: 'CGEx1B3rt2V8kGXfz3tXvUat865SSL9VcLncQNnkJ6Ve',
  GPU_VAULT_ATA: 'HgBn4nYLJkmWSd3qsgDD6WANUhG84Fyk9s9od7RwffAz',
};

async function tvl(api) {
  // Track SOL in vault
  await sumTokens2({
    api,
    solOwners: [ADDRESSES.SOL_VAULT],
  });
  
  // Track GPU tokens in ATA
  await sumTokens2({
    api,
    tokenAccounts: [ADDRESSES.GPU_VAULT_ATA],
  });
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: 'TVL counts SOL locked in the mining vault plus GPU tokens locked in the GPU vault. Mining Tycoon is a dual-currency mining pool where users buy mining power with SOL or GPU tokens and earn proportional rewards from both vaults.',
};
