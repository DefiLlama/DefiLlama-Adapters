import { Liq } from "../utils/types";
import WebSocket from 'ws';

const ORACLE_CONTRACT_ADDRESS = "r0kkwvymxepycxelyhsg7xwcat2w4h5303rkukck2gx7433avh22jdldycvmq";
const LOAN_CONTRACT_ADDRESS = "rvtgwvmtp4hy5k9alcwc5yt69k4jnshevdwapq43w7hp8m7hwj60szuun6naf";

const ORACLE_TOKEN_ID = "d0d46f5cbd82188acede0d3e49c75700c19cb8331a30101f0bb6a260066ac972";
const MUSD_TOKEN_ID = "b38a33f750f84c5c169a6f23cb873e6e79605021585d4f3408789689ed87f366";

/// Sats in one BCH
const COIN = 100_000_000n;

/**
 * Moria Protocol Liquidation Adapter
 *
 * Moria Protocol is a decentralized stablecoin system built on Bitcoin Cash (BCH) blockchain
 * that allows users to mint MUSD stablecoins by locking BCH as collateral.
 */

interface MoriaPosition {
  nfthash: string; // Hash of NFT token ID + commitment. The owner of this NFT holds the loan.
  collateralAmount: number; // BCH amount in satoshis
  liquidationPrice: number; // BCH price in USD at which position becomes liquidatable
}

/**
 * Connect to a Rostrum Electrum Server
 * @returns WebSocket connection object
 */
const connectElectrum = async (): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://rostrum.moria.money:443');

    ws.on('open', async () => {

      // Test the connection with server.ping
      try {
        const pingRequest = createElectrumRequest('server.ping', [], 1);
        await sendElectrumRequest(ws, pingRequest);
        resolve(ws);
      } catch (pingError) {
        console.error('Server ping failed:', pingError);
        ws.close();
        reject(pingError);
      }
    });

    ws.on('error', (error: any) => {
      console.error('WebSocket connection error:', error);
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket connection timeout'));
    }, 10000);
  });
};

/**
 * Request ID counter for unique request identification
 */
let requestIdCounter = 1;

/**
 * Create a standardized Electrum RPC request
 * @param method - RPC method name
 * @param params - RPC parameters
 * @param id - Optional request ID (auto-generated if not provided)
 * @returns JSON-RPC 2.0 request object
 */
const createElectrumRequest = (method: string, params: any[] = [], id?: number) => {
  return {
    method,
    params,
    id: id ?? requestIdCounter++
  };
};

/**
 * Send a request over WebSocket with proper Electrum protocol formatting
 * @param ws - WebSocket connection
 * @param request - JSON-RPC request object
 * @returns Promise with RPC response
 */
const sendElectrumRequest = async (ws: WebSocket, request: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Send request with newline as required by Electrum protocol
    ws.send(JSON.stringify(request) + '\n');

    const timeout = setTimeout(() => {
      reject(new Error(`RPC call timeout: ${request.method}`));
    }, 10000);

    ws.once('message', (data: any) => {
      clearTimeout(timeout);
      try {
        const response = JSON.parse(data.toString());
        if (response.id === request.id) {
          if (response.error) {
            reject(new Error(`RPC error: ${response.error.message}`));
          } else {
            resolve(response.result);
          }
        } else {
          reject(new Error(`Unexpected response ID: expected ${request.id}, got ${response.id}`));
        }
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
};

/**
 * Helper function to make Electrum RPC calls
 * @param ws - WebSocket connection
 * @param method - RPC method name
 * @param params - RPC parameters
 * @param id - Optional request ID
 * @returns Promise with RPC response
 */
const electrumCall = async (ws: WebSocket, method: string, params: any[] = [], id?: number): Promise<any> => {
  const request = createElectrumRequest(method, params, id);
  return sendElectrumRequest(ws, request);
};

/**
 * Query the loan contract to get all active loan positions
 * @param ws - Connected WebSocket client
 * @param oracleTimestamp - Current timestamp from oracle
 * @param bchPrice - BCH price in USD from oracle
 * @returns Array of active loan positions
 */
const queryLoanPositions = async (ws: WebSocket, oracleTimestamp: number, bchPrice: number): Promise<MoriaPosition[]> => {

    // Get UTXOs from the loan contract address
    const utxos = await electrumCall(ws, 'token.address.listunspent', [LOAN_CONTRACT_ADDRESS, null, MUSD_TOKEN_ID]);

    // Filter UTXOs that have commitment (these are loans)
    const loanUtxos = utxos.unspent.filter((utxo: any) => utxo.commitment);

    return loanUtxos.map((utxo: any) => parsePosition(utxo, oracleTimestamp, bchPrice));
};

/// Calculate interest accumulated since a loan was created
const interestOwed = (loanCreationTime: number, principal: bigint, annualInterestBps: number, oracleTime: number): bigint => {
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
    // (principal * annualInterestBP * daysElapsed) / (BASIS_POINTS * 365)
    return (
        1n +
        (principal * BigInt(annualInterestBps) * daysElapsed) /
        (BigInt(basisPoints) * 365n)
    );
}

/**
 * Parse raw contract data into MoriaPosition object
 * @param rawData - Raw data from the contract
 * @param oracleTimestamp - Current timestamp from oracle
 * @param bchPrice - BCH price in USD from oracle
 * @returns Parsed MoriaPosition object
 */
const parsePosition = (rawData: any, oracleTimestamp: number, bchPrice: number): MoriaPosition => {
  // Parse the commitment hex string
  const commitmentHex = rawData.commitment;
  const commitmentBuffer = Buffer.from(commitmentHex, 'hex');

  // Loan commitment format:
  // borrowerNFT - 32 bytes (0-31)
  // principal - 2 bytes (32-33), scale x100, so 1 = 100 tokens
  // annualInterestNP - 2 bytes (34-35)
  // timestamp - 4+ bytes (36+)

  // Extract borrower NFT hash (32 bytes) - hash of NFT token ID + commitment
  const borrowerNFTHash = commitmentBuffer.subarray(0, 32).toString('hex');

  // Extract principal (2 bytes, little-endian)
  const principalRaw = BigInt(commitmentBuffer.subarray(32, 34).readUInt16LE(0));
  const principal = principalRaw * 100n; // MUSD cents

  // Annual interest rate (2 bytes, little-endian)
  const annualInterestRaw = commitmentBuffer.subarray(34, 36).readUInt16LE(0);
  const annualInterestBps = annualInterestRaw;

  // Loan creation timestamp (4 bytes, little-endian)
  const timestamp = commitmentBuffer.subarray(36, 40).readUInt32LE(0);

  // Calculate liquidation status based on contract logic
  const collateral = rawData.value; // BCH amount in satoshis

  const interest = interestOwed(timestamp, principal, annualInterestBps, oracleTimestamp);
  const totalOwed = principal + interest;
  const totalOwedUSD = (Number(totalOwed) / 100);
  const liquidationPrice = totalOwedUSD / (collateral / Number(COIN) * 10/12);


  return {
    nfthash: borrowerNFTHash,
    collateralAmount: rawData.value, // BCH value in satoshis
    liquidationPrice: liquidationPrice // BCH price in USDat which position becomes liquidatable
  };
};

/**
 * Get BCH price from D3lphi oracle via Electrum
 * @param ws - Connected WebSocket client
 * @returns Object with BCH price in USD and oracle timestamp
 */
const getBCHPriceFromOracle = async (ws: WebSocket): Promise<{price: number, timestamp: number}> => {
  try {
    // Get UTXOs from the oracle contract address
    const utxos = await electrumCall(ws, 'token.address.listunspent', [ORACLE_CONTRACT_ADDRESS, null, ORACLE_TOKEN_ID]);

    // Filter UTXOs that have commitment data
    const utxosWithCommitment = utxos.unspent.filter((utxo: any) => utxo.commitment);

    if (utxosWithCommitment.length === 0) {
      throw new Error("No UTXOs with commitment found");
    }

    // Get the first UTXO with commitment
    const oracleUtxo = utxosWithCommitment[0];

    // Parse the commitment to extract BCH price and timestamp
    const commitmentHex = oracleUtxo.commitment;
    const commitmentBuffer = Buffer.from(commitmentHex, 'hex');

    // Extract timestamp from first 6 bytes (48-bit little-endian)
    const timestampBuffer = commitmentBuffer.subarray(0, 6);
    const oracleTimestamp = timestampBuffer.readUIntLE(0, 6); // Read 6 bytes as little-endian

    // Extract price from bytes 12-15 (4 bytes) as 32-bit little-endian in cents
    const priceBuffer = commitmentBuffer.subarray(12, 16);
    const priceCents = priceBuffer.readUInt32LE(0);

    // Convert cents to dollars
    const priceDollars = priceCents / 100;

    return { price: priceDollars, timestamp: oracleTimestamp };
  } catch (error) {
    console.error("Error fetching BCH price from oracle:", error);
    throw error;
  }
};

const positions = async (): Promise<Liq[]> => {
  let ws: WebSocket | null = null;

  try {
    // Connect to WebSocket first
    ws = await connectElectrum();

    // Get BCH price from oracle
    const oracleData = await getBCHPriceFromOracle(ws);

    // Get loan positions from contract
    const loanPositions = await queryLoanPositions(ws, oracleData.timestamp, oracleData.price);

    // Convert all positions to Liq objects (not just liquidatable ones)
    const liquidations: Liq[] = loanPositions.map(position => ({
      // TODO: Technically owned by the NFT represented by this hash; but the bitcoin cash address holding the NFT 
      // may be better here. Need an API call to get bitcoin cash address holding NFT.
      // Does DefilLama support bitcoincash addresses anyway?
      owner: position.nfthash,
      collateral: 'bitcoin-cash', // Bitcoin Cash token symbol on coingecko
      collateralAmount: position.collateralAmount.toString(),
      liqPrice: position.liquidationPrice,
    }));

    return liquidations;
  } finally {
    // Clean up the connection
    if (ws) {
      try {
        ws.close();
      } catch (closeError) {
        console.error("Error closing WebSocket connection:", closeError);
      }
    }
  }
};

module.exports = {
  bitcoincash: {
    liquidations: positions,
  },
};
