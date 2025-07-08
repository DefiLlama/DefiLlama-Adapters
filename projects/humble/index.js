const { toUSDTBalances } = require('../helper/balances');
const { get } = require('../helper/http');

async function tvl(){
    const response = await get('https://free-api.vestige.fi/providers?currency=USD')
    const data = response.find(p => p.id === 'H2')
    return toUSDTBalances(data.tvl);
}

module.exports = {
    deadFrom: '2025-06-01',
    timetravel: false,
    misrepresentedTokens:true,
    algorand:{ tvl }
}
