const { sumTokens2 } = require('../helper/solana');

// USDC mint on Solana mainnet
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Memento vault treasury addresses (Solana)
const VAULT_TREASURIES = [
  'B59fPDrLRsCDzH8LJCAAcvewRA4f2dD7r9Hq61qvFNbV',  // Vault 01 - Dividend Delta-Neutral
  'HpqfwkKtwJ5dHKVVpvLsSb9fKryPMNa8BF4Ym38QDZfk',  // Vault 02 - Basis & Funding Arbitrage
  '5Y8y875sYt6iWghz86o9VyjeNat3Daird8fRapZikUmx',  // Vault 03 - REITs / Real Estate
  '2qDaW8pMdZvPt8hwsBMh7PHQvMhsSTLFNKMnYiuuMdUt',  // Vault 04 - RWA Cashflow
  'CRy2E5u3yoemtcVcj9cxCeFZeNHoiuKyNiQmcaWnMMba',  // Vault 05 - Stablecoins
];

async function tvl(api) {
  return sumTokens2({
    owners: VAULT_TREASURIES,
    tokens: [USDC_MINT],
  });
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated by summing USDC balances held in Memento vault treasury wallets on Solana.',
  solana: {
    tvl,
  },
};
