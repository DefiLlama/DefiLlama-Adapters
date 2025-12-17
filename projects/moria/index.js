const WebSocket = require('ws');

// Moria Protocol constants
const LOAN_CONTRACT_ADDRESS = "rvtgwvmtp4hy5k9alcwc5yt69k4jnshevdwapq43w7hp8m7hwj60szuun6naf";
const MUSD_TOKEN_ID = "b38a33f750f84c5c169a6f23cb873e6e79605021585d4f3408789689ed87f366";

/**
 * Connect to a Rostrum Electrum Server
 * @returns WebSocket connection object
 */
const connectElectrum = async () => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://rostrum.moria.money:443');

    ws.on('open', async () => {
      try {
        const pingRequest = createElectrumRequest('server.ping', [], 1);
        await sendElectrumRequest(ws, pingRequest);
        resolve(ws);
      } catch (pingError) {
        console.error('Server ping failed:', pingError);
        reject(pingError);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      reject(error);
    });

    ws.on('close', () => {
      // we're done, do nothing
    });
  });
};

let requestIdCounter = 1;

/**
 * Create a JSON-RPC 2.0 request object for Electrum
 */
const createElectrumRequest = (method, params = [], id) => {
  return {
    jsonrpc: '2.0',
    method,
    params,
    id: id ?? requestIdCounter++
  };
};

const responseCallbacks = new Map();

/**
 * Send a request over WebSocket with proper Electrum protocol formatting
 */
const sendElectrumRequest = async (ws, request) => {
  return new Promise((resolve, reject) => {
    responseCallbacks.set(request.id, { resolve, reject });

    ws.send(JSON.stringify(request) + '\n');

    const timeout = setTimeout(() => {
      responseCallbacks.delete(request.id);
      reject(new Error(`Electrum RPC request timed out for ID ${request.id}`));
    }, 10000);

    const messageHandler = (message) => {
      const response = JSON.parse(message);
      if (response.id === request.id) {
        clearTimeout(timeout);
        ws.off('message', messageHandler);
        responseCallbacks.delete(request.id);
        if (response.error) {
          reject(new Error(`Electrum RPC error: ${response.error.message || JSON.stringify(response.error)}`));
        } else {
          resolve(response.result);
        }
      } else if (responseCallbacks.has(response.id)) {
        const cb = responseCallbacks.get(response.id);
        responseCallbacks.delete(response.id);
        clearTimeout(timeout);
        ws.off('message', messageHandler);
        if (response.error) {
          cb?.reject(new Error(`Electrum RPC error: ${response.error.message || JSON.stringify(response.error)}`));
        } else {
          cb?.resolve(response.result);
        }
      }
    };
    ws.on('message', messageHandler);
  });
};

const fetchTVL = async (ws) => {
  const request = createElectrumRequest('token.address.listunspent', [LOAN_CONTRACT_ADDRESS, null, MUSD_TOKEN_ID]);
  const utxos = await sendElectrumRequest(ws, request);

  // ignore any random fungable token sends to the contract; if it has commitment, it's a loan position
  const loanUtxos = utxos.unspent.filter((utxo) => utxo.commitment);
  const sats = loanUtxos.reduce((sum, utxo) => sum + utxo.value, 0);

  return sats;
};

/**
 * TVL function - tracks total BCH collateral locked
 */
async function tvl() {
  let ws = null;
  try {
    ws = await connectElectrum();
    const collateralSats = await fetchTVL(ws);
    const totalCollateralBCH = collateralSats / 100_000_000;

    // Return BCH as TVL
    return {
      'bitcoin-cash': totalCollateralBCH
    };
  } finally {
    if (ws) {
      ws.close();
    }
  }
}


module.exports = {
  methodology: "Lookup Moria Protocol loan positions on the contract address via the Electrum protocol and sum up the total BCH collateral locked.",
  timetravel: false,
  bitcoincash: {
    tvl,
  },
};
