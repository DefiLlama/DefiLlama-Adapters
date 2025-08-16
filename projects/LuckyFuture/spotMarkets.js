const ADDRESSES = require('../helper/coreAssets.json')
const anchor = require('@coral-xyz/anchor');
const { PublicKey } = require("@solana/web3.js");
const DRIFT_PROGRAM_ID = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH')
const CUSTOM_PROGRAM_ID = new PublicKey('EDnxACbdY1GeXnadh5gRuCJnivP7oQSAHGGAHCma4VzG')

const SPOT_MARKETS = {
  0: {
    name: 'USDC',
    mint: ADDRESSES.solana.USDC,
    decimals: 6
  },
  1: {
    name: 'SOL',
    mint: ADDRESSES.solana.SOL,
    decimals: 9
  },
  17:{
    name:'dSOL',
    mint:'Dso1bDeDjCQxTrWHqUUi63oBvV7Mdm6WaobLbQ7gnPQ', 
    decimals: 9
  },
  19: {
    name: 'JLP',
    mint: '27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4',
    decimals: 6
  }
};

const PERP_MARKETS = {
  0: {
    name: 'SOL-PERP',
    mint: ADDRESSES.solana.SOL,
    baseDecimals: 9,
    quoteDecimals: 6
  },
  1: {
    name: 'BTC-PERP',
    mint: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
    baseDecimals: 8,
    quoteDecimals: 6
  },
  2: {
    name: 'ETH-PERP',
    mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    baseDecimals: 8,
    quoteDecimals: 6
  },
};

function getTokenMintFromMarketIndex(marketIndex) {
  if (!SPOT_MARKETS[marketIndex]) {
    throw new Error(`Market index ${marketIndex} not found`);
  }
  return SPOT_MARKETS[marketIndex].mint;
}

function getPerpTokenMintFromMarketIndex(marketIndex) {
  if (!PERP_MARKETS[marketIndex]) {
    throw new Error(`Perp market index ${marketIndex} not found`);
  }
  return PERP_MARKETS[marketIndex].mint;
}

function getDecimalsByMarketIndex(marketIndex, isPerp = false) {
  if (isPerp) {
    if (!PERP_MARKETS[marketIndex]) {
      throw new Error(`Perp market index ${marketIndex} not found`);
    }
    return PERP_MARKETS[marketIndex].baseDecimals;
  }

  if (!SPOT_MARKETS[marketIndex]) {
    throw new Error(`Spot market index ${marketIndex} not found`);
  }
  return SPOT_MARKETS[marketIndex].decimals;
}

function processSpotPosition(position, spotMarketAccountInfo) {
  const decimals = getDecimalsByMarketIndex(position.market_index);
  const decimalAdjustment = 9 - decimals;
  let balance = position.scaled_balance;

  // Apply decimal adjustment
  if (decimalAdjustment > 0) {
    balance /= BigInt(10 ** decimalAdjustment);
  }

  // For borrowed positions (balance_type === 1), apply interest rate
  if (position.balance_type === 1) {
    const cumulativeBorrowInterest = getSpotMarketCumulativeBorrowInterest(spotMarketAccountInfo);
    // Apply interest rate to the balance
    balance = (balance * cumulativeBorrowInterest) / BigInt(10 ** 10); 
    return -balance;  // Return negative for borrows
  }

  return balance;  // Return positive for deposits
}

function getSpotMarketCumulativeBorrowInterest(accountInfo) {
    if (!accountInfo) { 
      throw new Error(`No account info found for market`);
    }
  
    const CUMULATIVE_BORROW_INTEREST_OFFSET = 8 + 48 + 32 + 256 + (16 * 8) + 8;
  
    const lower64Bits = accountInfo.data.readBigInt64LE(CUMULATIVE_BORROW_INTEREST_OFFSET);
    const upper64Bits = accountInfo.data.readBigInt64LE(CUMULATIVE_BORROW_INTEREST_OFFSET + 8);
    
    return (upper64Bits << 64n) + lower64Bits;
  }


function processPerpPosition(position) {


  let baseBalance = position.market_index === 0 ? position.base_asset_amount : position.base_asset_amount / BigInt(10);

  let quoteBalance = position.quote_asset_amount;

  return { baseBalance, quoteBalance };
}


function getPerpMarketFundingRates(accountInfo) {
  if (!accountInfo) {
    throw new Error(`No account info found for market`);
  }
  let factorToPrecision = 1n;


  const CUMULATIVE_FUNDING_OFFSET = 8 + 48 + 32 + 256 + (16 * 15) + 24;

  const cumulativeFundingRateLong = accountInfo.data.readBigInt64LE(CUMULATIVE_FUNDING_OFFSET);
  const cumulativeFundingRateShort = accountInfo.data.readBigInt64LE(CUMULATIVE_FUNDING_OFFSET + 16);

  return {
    cumulativeFundingRateLong,
    cumulativeFundingRateShort,
    factorToPrecision
  };
}

module.exports = {
  getTokenMintFromMarketIndex,
  getDecimalsByMarketIndex,
  processSpotPosition,
  processPerpPosition,
  SPOT_MARKETS,
  PERP_MARKETS,
  getPerpMarketFundingRates,
  getPerpTokenMintFromMarketIndex,
  getVaultPublicKey,
};

function getVaultPublicKey(seed, marketIndex) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode(seed)),
      new anchor.BN(marketIndex).toArrayLike(Buffer, 'le', 2),
    ], DRIFT_PROGRAM_ID)[0]
}