const { get_account_tvl } = require('../helper/chain/eos');

const tokens = [
  ['eosio.token', 'EOS', 'eos'],
  ['tethertether', 'USDT', 'tether'],
  ['btc.ptokens', 'PBTC', 'ptokens-btc'],
  ['token.defi', 'BOX', 'defibox'],
  ['minedfstoken', 'DFS', 'defis-network'],
  ['emanateoneos', 'EMT', 'emanate'],
  ['token.newdex', 'DEX', 'newdex-token'],
  ['chexchexchex', 'CHEX', 'chex-token'],
  ['everipediaiq', 'IQ', 'everipedia'],
  ['eosiotptoken', 'TPT', 'token-pocket'],
  ['core.ogx', 'OGX', 'organix'],
];

// https://apps.defis.network/
// AMM swap
async function eos() {
  return await get_account_tvl('defisswapcnt', tokens);
}

// https://dfs.land/
const axios = require('axios');
const endpoint = 'https://api.dfs.land';
async function dfs() {
  const info = await axios(`${endpoint}/v1/chain/get_table_rows`, {
    method: 'POST',
    data: JSON.stringify({
      code: 'swapswapswap',
      scope: 'swapswapswap',
      table: 'markets',
      json: true,
      limit: -1,
    }),
  });
  const markets = info.data.rows || [];
  const dfsMkt = markets.find((m) => m.mid == 1);
  let dfsPrice = 1;
  if (!dfsMkt) {
    dfsPrice = 1;
  } else {
    dfsPrice = parseFloat(dfsMkt.reserve0) / parseFloat(dfsMkt.reserve1);
  }
  let tvl = 0;
  for (let i = 0; i < markets.length; i++) {
    const m = markets[i];
    if (m.contract0 == 'usdtusdtusdt' && m.sym0 == '8,USDT') {
      tvl += parseFloat(m.reserve0) * 2;
    } else if (m.contract1 == 'usdtusdtusdt' && m.sym1 == '8,USDT') {
      tvl += parseFloat(m.reserve1) * 2;
    } else if (m.contract0 == 'eosio.token' && m.sym0 == '8,DFS') {
      tvl += parseFloat(m.reserve0) * 2 * dfsPrice;
    } else if (m.contract1 == 'eosio.token' && m.sym1 == '8,DFS') {
      tvl += parseFloat(m.reserve1) * 2 * dfsPrice;
    }
  }
  return {
    tether: tvl,
  };
}

module.exports = {
  timetravel: false,
  methodology: `DFS TVL is achieved by querying token balances from DFS's AMM swap liquidity smart contract.`,
  eos: {
    tvl: eos,
  },
  dfs: {
    tvl: dfs,
  },
};
