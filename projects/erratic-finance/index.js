const { Connection, PublicKey } = require('@solana/web3.js');
const { sumTokens2 } = require('../helper/solana');
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
const connection = new Connection(SOLANA_RPC_URL);

const treasuryAddress = 'AC6hxrHufwguXYcPdCibahS7nemw8SQhPSHGEArQ97sJ';

async function tvl() {
  return await sumTokens2({solOwners: [treasuryAddress]});
}

async function staking() {
  try {
    const holders = await getGovernanceParticipants();
    return {
      'governance-participant': holders
    };
  } catch (error) {
    console.error('Staking calculation error:', error);
    return {
      'governance-participant': 0 
    };
  }
}

async function getGovernanceParticipants() {
  const mintAddress = new PublicKey('FPm55sjSoMdBTCMhZzVWeTB5EdDH6EZuRaW5vAyvDqkW');
  const tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
  const tokenAccounts = await connection.getParsedProgramAccounts(
    tokenProgramId,
    {
      filters: [
        { dataSize: 165 }, 
        { 
          memcmp: {
            offset: 0, 
            bytes: mintAddress.toBase58()
          }
        }
      ]
    }
  );

  const holders = new Set();
  for (const account of tokenAccounts) {
    try {
      const ownerPubkey = account.account.data.parsed.info.owner;
      holders.add(ownerPubkey);
    } catch (e) {
      console.warn('Error parsing account:', account.pubkey.toString());
    }
  }
  
  return holders.size;
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking
  }
};
