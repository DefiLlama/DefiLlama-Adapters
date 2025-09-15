const WebSocket = require('ws');

// Moria Protocol constants
const ORACLE_CONTRACT_ADDRESS = "r0kkwvymxepycxelyhsg7xwcat2w4h5303rkukck2gx7433avh22jdldycvmq";
const LOAN_CONTRACT_ADDRESS = "rvtgwvmtp4hy5k9alcwc5yt69k4jnshevdwapq43w7hp8m7hwj60szuun6naf";
const ORACLE_TOKEN_ID = "d0d46f5cbd82188acede0d3e49c75700c19cb8331a30101f0bb6a260066ac972";
const MUSD_TOKEN_ID = "b38a33f750f84c5c169a6f23cb873e6e79605021585d4f3408789689ed87f366";

// Sats in one BCH
const COIN = 100_000_000n;

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
      try {
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
      } catch (e) {
        console.error("Error parsing Electrum WebSocket message:", e);
      }
    };
    ws.on('message', messageHandler);
  });
};

/**
 * Helper function to make an Electrum RPC call
 */
const electrumCall = async (ws, method, params = [], id) => {
  const request = createElectrumRequest(method, params, id);
  return sendElectrumRequest(ws, request);
};

/**
 * Get BCH price from D3lphi oracle via Electrum
 */
const getBCHPriceFromOracle = async (ws) => {
  try {
    const utxos = await electrumCall(ws, 'token.address.listunspent', [ORACLE_CONTRACT_ADDRESS, null, ORACLE_TOKEN_ID]);
    const utxosWithCommitment = utxos.unspent.filter((utxo) => utxo.commitment);

    if (utxosWithCommitment.length === 0) {
      throw new Error("No UTXOs with commitment found");
    }

    const oracleUtxo = utxosWithCommitment[0];
    const commitmentHex = oracleUtxo.commitment;
    const commitmentBuffer = Buffer.from(commitmentHex, 'hex');

    // Extract timestamp from first 6 bytes (48-bit little-endian)
    const timestampBuffer = commitmentBuffer.subarray(0, 6);
    const oracleTimestamp = timestampBuffer.readUIntLE(0, 6);

    // Extract price from bytes 12-15 (4 bytes) as 32-bit little-endian in cents
    const priceBuffer = commitmentBuffer.subarray(12, 16);
    const priceCents = priceBuffer.readUInt32LE(0);

    const priceDollars = priceCents / 100;

    return { price: priceDollars, timestamp: oracleTimestamp };
  } catch (error) {
    console.error("Error fetching BCH price from oracle:", error);
    throw error;
  }
};

/**
 * Calculate interest accumulated since a loan was created
 */
const interestOwed = (loanCreationTime, principal, annualInterestBps, oracleTime) => {
  if (oracleTime < loanCreationTime) {
    throw Error("Oracle timestamp cannot be less than loan timestamp");
  }

  const durationDay = 86_400;
  const basisPoints = 10_000;

  // Calculate days elapsed using integer division
  const daysElapsed = (BigInt(oracleTime) -
    BigInt(loanCreationTime) +
    BigInt(durationDay) -
    1n) /
    BigInt(durationDay);

  // Calculate interest using pure integer math
  return (
    1n +
    (principal * BigInt(annualInterestBps) * daysElapsed) /
    (BigInt(basisPoints) * 365n)
  );
};

/**
 * Query the loan contract to get all active loan positions
 */
const queryLoanPositions = async (ws, oracleTimestamp) => {
  const utxos = await electrumCall(ws, 'token.address.listunspent', [LOAN_CONTRACT_ADDRESS, null, MUSD_TOKEN_ID]);
  const loanUtxos = utxos.unspent.filter((utxo) => utxo.commitment);

  const positions = [];
  for (const utxo of loanUtxos) {
    const commitmentHex = utxo.commitment;
    const commitmentBuffer = Buffer.from(commitmentHex, 'hex');

    // Extract borrower NFT hash (32 bytes)
    const borrowerNFTHash = commitmentBuffer.subarray(0, 32).toString('hex');

    // Extract principal (2 bytes, little-endian)
    const principalRaw = BigInt(commitmentBuffer.subarray(32, 34).readUInt16LE(0));
    const principal = principalRaw * 100n; // MUSD cents

    // Annual interest rate (2 bytes, little-endian)
    const annualInterestRaw = commitmentBuffer.subarray(34, 36).readUInt16LE(0);
    const annualInterestBps = annualInterestRaw;

    // Loan creation timestamp (4 bytes, little-endian)
    const timestamp = commitmentBuffer.subarray(36, 40).readUInt32LE(0);

    const collateral = utxo.value; // BCH amount in satoshis
    const interest = interestOwed(timestamp, principal, annualInterestBps, oracleTimestamp);
    const totalOwed = principal + interest;

      positions.push({
        nfthash: borrowerNFTHash,
        collateralAmount: collateral, // BCH value in satoshis
        totalOwed: totalOwed, // MUSD amount including interest
      });
  }

  return positions;
};

/**
 * TVL function - tracks total BCH collateral locked
 */
async function tvl(timestamp, block, chainBlocks, { api }) {
  let ws = null;
  try {
    ws = await connectElectrum();
    const oracleData = await getBCHPriceFromOracle(ws);
    const loanPositions = await queryLoanPositions(ws, oracleData.timestamp);

    // Sum up all BCH collateral
    const totalCollateralSatoshis = loanPositions.reduce((sum, position) => sum + position.collateralAmount, 0);
    const totalCollateralBCH = Number(totalCollateralSatoshis) / Number(COIN);

    // Return BCH as TVL
    return {
      'bitcoin-cash': totalCollateralBCH
    };
  } finally {
    if (ws) {
      try {
        ws.close();
      } catch (closeError) {
        console.error("Error closing WebSocket connection:", closeError);
      }
    }
  }
}

/**
 * Borrowed function - tracks total MUSD debt outstanding
 */
async function borrowed(timestamp, block, chainBlocks, { api }) {
  let ws = null;
  try {
    ws = await connectElectrum();
    const oracleData = await getBCHPriceFromOracle(ws);
    const loanPositions = await queryLoanPositions(ws, oracleData.timestamp, oracleData.price);

    // Sum up all MUSD borrowed
    const totalBorrowedCents = loanPositions.reduce((sum, position) => sum + Number(position.totalOwed), 0);
    const totalDebtUSD = totalBorrowedCents / 100;

    // TODO: Return borrowed when MUSD is tracked on coingecko.
    console.log("Total borrowed:", totalDebtUSD, "MUSD");

    return { };
  } finally {
    if (ws) {
      try {
        ws.close();
      } catch (closeError) {
        console.error("Error closing WebSocket connection:", closeError);
      }
    }
  }
}

module.exports = {
  methodology: "Lookup Moria Protocol loan positions on the contract address via Electrum protocol and sum up the total BCH collateral locked and the total MUSD borrowed.",
  timetravel: false,
  bitcoincash: {
    tvl,
    borrowed,
  },
};
