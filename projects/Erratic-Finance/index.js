const { getConnection, } = require('@defillama/sdk/build/solana');
const { PublicKey } = require('@solana/web3.js');

async function tvl() {
  const connection = getConnection();
  const treasuryBalance = await connection.getBalance(
    new PublicKey('AC6hxrHufwguXYcPdCibahS7nemw8SQhPSHGEArQ97sJ')
  );
  
  return {
    'solana': treasuryBalance / 1e9 
  };
}

async function staking() {
  const holders = await getHolderCount();
  return {
    'solana': holders
  };
}

async function getHolderCount() {
  const connection = getConnection();
  const mintAddress = new PublicKey('FPm55sjSoMdBTCMhZzVWeTB5EdDH6EZuRaW5vAyvDqkW');
  const accounts = await connection.getTokenAccountsByOwner(mintAddress, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  });
  const holders = new Set();
  for (const account of accounts.value) {
    const owner = account.account.data.slice(32, 64); 
    holders.add(owner.toString('hex'));
  }
  return holders.size;
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking
  },
  hallmarks: [
    [Math.floor(new Date('2025-06-07')/1000), "NFT Launch"]
  ]
};
