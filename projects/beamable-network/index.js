const { sumTokens2 } = require('../helper/solana');

// BMB Token Mint Address
const BMB_TOKEN = 'BMBtwz6LFDJVJd2aZvL5F64fdvWP3RPn4NP5q9Xe15UD';

// Core Anchorage wallets with locked BMB
const CORE_WALLETS = [
  '7xQVXzXC5fz4LEq5PsHjKkFaQsenEp8KBLfsU8vXHixT', // Core Team
  'GkqBtacaEuCGr5KortDHUF7WNT6bSasCsRSEpoBbgPKH', // Investors
  '9zx2QN7DwGdDdU81SjKFve31F8Midg8RHs7wgrE7KguR', // Advisors
];

// Beamable Network Program Vaults
const PROGRAM_VAULTS = [
  'SiuEivQxySKyoSLgq2HaRSp68TEU85uRAfz56kk6T45',  // depin: flexlock vault
  '6pZERJjcMpNjPZ6ovnXWC6LzwkXLAYgAR1URAEs63cWC', // worker_stake: collected emissions
  '2zMVb81qUwusaT4EbK8gvpyJBHdJ8uPwMcrefSkLMU6Z', // worker_stake: community stake
  'HBjL14QGKnfVtdxVRQRong1WHnYb89gyjBBQtwLQSLVi', // worker_stake: worker's stake
];

async function staking(api) {
  const allOwners = [...CORE_WALLETS, ...PROGRAM_VAULTS];

  return sumTokens2({
    api,
    tokens: [BMB_TOKEN],
    owners: allOwners,
  });
}

module.exports = {
  timetravel: false,
  methodology: "Counts the number of BMB tokens locked across Core Anchorage wallets and Beamable Network program vaults.",
  solana: {
    tvl: () => ({}),
    staking,
  },
};
