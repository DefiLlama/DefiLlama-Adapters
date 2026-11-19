const WebSocket = require('ws');

// Each active loan UTXO holds a mutable-capability NFT with the paryonUSD tokenID category together with the BCH collateral
const LOAN_CONTRACT = 'bitcoincash:pv8zrfxplp50apvppy5ku5mjp3gqgkp94dvwf82lg0st4ptk5agfyrtpjvf8a';
const PARYON_TOKEN_ID = '2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544';
const ELECTRUM_WSS = 'wss://electrum.imaginary.cash:50004';
const TIMEOUT_MS = 10000;

function electrumCall(method, params) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(ELECTRUM_WSS);
    const timer = setTimeout(() => { ws.close(); reject(new Error(`Electrum timeout: ${method}`)); }, TIMEOUT_MS);
    ws.on('open', () => ws.send(JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }) + '\n'));
    ws.on('message', (raw) => {
      clearTimeout(timer);
      ws.close();
      try {
        const res = JSON.parse(raw);
        res.error ? reject(new Error(res.error.message)) : resolve(res.result);
      } catch (e) { reject(e); }
    });
    ws.on('error', (e) => { clearTimeout(timer); reject(e); });
  });
}

async function tvl() {
  // Active loans = UTXOs holding a mutable-capability NFT with the paryonUSD tokenID category
  const utxos = await electrumCall('blockchain.address.listunspent', [LOAN_CONTRACT, 'include_tokens']);
  if (!Array.isArray(utxos)) throw new Error('Electrum returned non-array UTXO list');
  const loanSats = utxos
    .filter(u => u.token_data?.category === PARYON_TOKEN_ID && u.token_data?.nft?.capability === 'mutable')
    .reduce((sum, u) => sum + u.value, 0);
  return { 'bitcoin-cash': loanSats / 1e8 };
}

module.exports = {
  methodology: 'Sum BCH collateral across all active loan UTXOs at the ParyonUSD mainnet-v1 loan contract (UTXOs marked by a mutable-capability NFT with the paryonUSD tokenID category), via the Electrum protocol.',
  timetravel: false,
  bitcoincash: { tvl },
};
