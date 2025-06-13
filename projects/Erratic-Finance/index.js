const https = require('https');
const NFT_MINT_ADDRESS = 'FPm55sjSoMdBTCMhZzVWeTB5EdDH6EZuRaW5vAyvDqkW';
const CONTRACT_ADDRESS = 'AC6hxrHufwguXYcPdCibahS7nemw8SQhPSHGEArQ97sJ';

const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';

async function getSolanaBalance(publicKey) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [publicKey]
    });

    const req = https.request(SOLANA_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(result.error.message);
          } else {
            resolve(result.result.value);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getMagicEdenCollectionStats(collectionSymbol) {
  return new Promise((resolve, reject) => {
    https.get(`https://api-mainnet.magiceden.io/collection_stats?collection_symbol=${collectionSymbol}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function tvl() {
  try {
    const contractBalance = await getSolanaBalance(CONTRACT_ADDRESS);
    
    const stats = await getMagicEdenCollectionStats(NFT_MINT_ADDRESS);
    
    const nftValue = (stats.floor_price * stats.total_supply) || 0;
    
    const totalSOL = (contractBalance / 1e9) + nftValue;
    
    return {
      solana: totalSOL
    };
  } catch (e) {
    console.error('TVL calculation error:', e);
    return {
      solana: 0
    };
  }
}

module.exports = {
  solana: {
    tvl
  }
};
