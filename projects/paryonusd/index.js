const WebSocket = require('ws');

// ParyonUSD mainnet-v1 deployment constants
// Each active loan UTXO holds a mutable-capability NFT with the paryonUSD tokenID category together with the BCH collateral
const LOAN_CONTRACT_ADDRESS = 'bitcoincash:pv8zrfxplp50apvppy5ku5mjp3gqgkp94dvwf82lg0st4ptk5agfyrtpjvf8a';
const PARYON_TOKEN_ID = '2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544';

// Public Fulcrum Electrum server with CashTokens support
const ELECTRUM_WSS = 'wss://electrum.imaginary.cash:50004';
const REQUEST_TIMEOUT_MS = 10000;

let requestIdCounter = 1;

/**
 * Create a JSON-RPC 2.0 request object for Electrum
 */
const createElectrumRequest = (method, params = [], id) => ({
  jsonrpc: '2.0',
  method,
  params,
  id: id ?? requestIdCounter++,
});

/**
 * Open a WebSocket connection to the Electrum server, resolving with the live socket.
 */
const connectElectrum = async () =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(ELECTRUM_WSS);
    ws.on('open', () => resolve(ws));
    ws.on('error', (err) => reject(err));
  });

/**
 * Send an Electrum JSON-RPC request over the socket and resolve with its result, with a timeout.
 */
const sendElectrumRequest = (ws, request) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.off('message', messageHandler);
      reject(new Error(`Electrum RPC timed out for id ${request.id}`));
    }, REQUEST_TIMEOUT_MS);

    const messageHandler = (raw) => {
      try {
        const response = JSON.parse(raw);
        if (response.id !== request.id) return;
        clearTimeout(timeout);
        ws.off('message', messageHandler);
        if (response.error) {
          reject(new Error(`Electrum RPC error: ${response.error.message || JSON.stringify(response.error)}`));
        } else {
          resolve(response.result);
        }
      } catch (err) {
        clearTimeout(timeout);
        ws.off('message', messageHandler);
        reject(err);
      }
    };
    ws.on('message', messageHandler);

    ws.send(JSON.stringify(request) + '\n');
  });

/**
 * Sum BCH satoshis locked across all active loan UTXOs at the loan contract address.
 */
const fetchCollateralSats = async (ws) => {
  // Fulcrum: "include_tokens" populates token_data on returned UTXOs
  const request = createElectrumRequest('blockchain.address.listunspent', [LOAN_CONTRACT_ADDRESS, 'include_tokens']);
  const utxos = await sendElectrumRequest(ws, request);

  // Active loans are marked by a mutable-capability NFT with the paryonUSD TokenID
  const loanUtxos = utxos.filter(
    (utxo) =>
      utxo.token_data?.category === PARYON_TOKEN_ID &&
      utxo.token_data?.nft?.capability === 'mutable'
  );
  return loanUtxos.reduce((sum, utxo) => sum + utxo.value, 0);
};

/**
 * DefiLlama TVL entrypoint: returns total BCH collateral locked in ParyonUSD.
 */
async function tvl() {
  let ws = null;
  try {
    ws = await connectElectrum();
    const collateralSats = await fetchCollateralSats(ws);
    const totalCollateralBCH = collateralSats / 100_000_000;

    return {
      'bitcoin-cash': totalCollateralBCH,
    };
  } finally {
    if (ws) ws.close();
  }
}

module.exports = {
  methodology:
    'Sum BCH collateral across all active loan UTXOs at the ParyonUSD mainnet-v1 loan contract address (UTXOs holding a mutable-capability NFT with the paryonUSD tokenID category), via the Electrum protocol.',
  timetravel: false,
  bitcoincash: {
    tvl,
  },
};
