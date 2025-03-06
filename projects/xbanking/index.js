const axios = require('axios');

async function fetchSolanaTVL() {
  const address = 'J8k11p1E2FKfYhVxgNkKT9xWUz7Npwqx1RPQvGcfo56H';
  const rpcUrl = 'https://api.mainnet-beta.solana.com';
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "getBalance",
    params: [address]
  };
  const res = await axios.post(rpcUrl, body);
  const lamports = res.data.result.value; 
  const sol = lamports / 1e9;

  const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
  const solPrice = priceRes.data.price;
  return sol * solPrice;
}

async function fetchTonTVL() {
  const address = 'EQDa4VOnTYlLvDJ0gZjNYm5PXfSmmtL6Vs6A_CZEtXCNICq_';
  const url = `https://toncenter.com/api/v2/getAddressInformation?address=${address}`;
  const res = await axios.get(url);
  const balanceNanotons = res.data.result.balance;
  const ton = balanceNanotons / 1e9;

  const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT');
  const tonPrice = priceRes.data.price;
  return ton * tonPrice;
}

async function fetchSuiTVL() {
    const address = '0x31472256fd9c48f9acacb7957b75c317cd97ac1973d71c9101bdcf365b17b550';
    const rpcUrl = 'https://sui-mainnet.public.blastapi.io';
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "suix_getAllBalances",
      params: [ address ]
    };
    
    const response = await axios.post(rpcUrl, body)
    const coins = response.data.result;
    const suiCoins = coins.filter(coin => coin.coinType === "0x2::sui::SUI");
    const totalBalance = suiCoins.reduce((sum, coin) => sum + Number(coin.totalBalance), 0);
    const balanceSui = totalBalance / 1e9;

    const balance = balanceSui;
    const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=SUIUSDT');
    const suiPrice = priceRes.data.price;
    return balance * suiPrice;
}

async function fetchBnbTVL() {
  const address = '0x09cfe6ab4e5646237f74586120fd1f0f80dace67';
  const rpcUrl = 'https://bsc-dataseed.binance.org/';
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBalance",
    params: [address, "latest"]
  };
  const res = await axios.post(rpcUrl, body);
  const balanceWei = BigInt(res.data.result);
  const bnb = Number(balanceWei) / 1e18;
  const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
  const bnbPrice = priceRes.data.price;
  return bnb * bnbPrice;
}

async function fetchArbTVL() {
  const address = '0x0529ea5885702715e83923c59746ae8734c553B7';
  const rpcUrl = 'https://arb1.arbitrum.io/rpc';
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBalance",
    params: [address, "latest"]
  };
  const res = await axios.post(rpcUrl, body);
  const balanceWei = BigInt(res.data.result);
  const arb = Number(balanceWei) / 1e18;
  const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ARBUSDT');
  const arbPrice = priceRes.data.price;
  return arb * arbPrice;
}

async function fetchAvaxTVL() {
  const address = '0x0639556F03714A74a5fEEaF5736a4A64fF70D206';
  const rpcUrl = 'https://api.avax.network/ext/bc/C/rpc';
  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBalance",
    params: [address, "latest"]
  };
  const res = await axios.post(rpcUrl, body);
  const balanceWei = BigInt(res.data.result);
  const avax = Number(balanceWei) / 1e18;
  const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=AVAXUSDT');
  const avaxPrice = priceRes.data.price;
  return avax * avaxPrice;
}

async function fetchBtcTVL() {
  const address = '1L34XHsVTokQ47UScyT5SVS8yvDY5TptLe';
  const url = `https://blockchain.info/q/addressbalance/${address}?confirmations=6`;
  const res = await axios.get(url);
  const satoshi = Number(res.data);
  const btc = satoshi / 1e8;
  const priceRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
  const btcPrice = priceRes.data.price;
  return btc * btcPrice;
}

const chains = [
  'solana',
  'ton',
  'sui',
  'bnb',
  'arbitrum',
  'avax',
  'btc'
]

async function fetchTotalTVL() {

  const results = await Promise.all([
    fetchSolanaTVL(),
    fetchTonTVL(),
    fetchSuiTVL(),
    fetchBnbTVL(),
    fetchArbTVL(),
    fetchAvaxTVL(),
    fetchBtcTVL()
  ]);

  const total = results.reduce((sum, value) => sum + value, 0);
  return total;
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    doublecounted: true,
    ...Object.fromEntries(Object.entries(chains).map(async chain => [chain[0], {
      tvl: await fetchTotalTVL(chain[1], false)
    }]))
  };
