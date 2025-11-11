
const { sumTokens2 } = require('../helper/solana');

async function withRetries(fn, retries = 4, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(1.5, i)));
    }
  }
}

async function solanaTvl(api) {
  const owners = [
    '2cbUAqNoySYkG5R7edjm1WLXgtty6PeCRDVJ7zZbodQm',  // usdc deposit on mint 
    '4Lgz21ZmgtgtGikoQy5ZpuCuBCwTZoLx364rHiQwngsH',  // usdc-cetes vault
    'ETkRSHbbWrzyqt4fFNu7bP29WCDL9kfmatnaMV2EgZGE', // usdc-eurob vault
    'H6Fqdwz9Z4dk8hotxLwN3LFx1sMZNZiCyoLWnQjfPzkf', // usdc-gilts vault
    '3bYZCXv6rWpbT3zizsTArUdZ4SEmDRMCWtjzasz8nVpK',  // usdc-tesouro vault
    'HhqQYBYbb3MHT8fiAidoxzH3eE5GvStgrEzkvk9ci9uF'   //usdc-ustry vault
  ];
  
  for (const owner of owners) {
    await withRetries(() => sumTokens2({ api, owner }));
    await new Promise(r => setTimeout(r, 2500));
  }
}

module.exports = {
  methodology: 'TVL from 6 Etherfuse token vaults',
  timetravel: false,
  solana: { tvl: solanaTvl },
};
