const { PublicKey } = require("@solana/web3.js");
const { getMultipleAccounts } = require('../helper/solana')
const axios = require("axios");

function deserializeUserPositions(accountInfo) {
  if (!accountInfo) {
    throw new Error('User account not found');
  }

  const buffer = accountInfo.data;

  // Deserialize spot positions
  const spotPositions = [];
  let offset = 104; // Anchor discriminator (8) + Skip authority(32) + delegate(32) + name(32) 

  for (let i = 0; i < 8; i++) {
    const spotPosition = {
      scaled_balance: buffer.readBigUInt64LE(offset),
      market_index: buffer.readUInt16LE(offset + 32),
      balance_type: buffer.readUInt8(offset + 34),
    };

    // Only push non-empty positions
    if (spotPosition.scaled_balance > 0n) {
      spotPositions.push(spotPosition);
    }
    offset += 40; // Size of SpotPosition struct
  }

  // Deserialize perp positions
  const perpPositions = [];
  for (let i = 0; i < 8; i++) {
    const lastCumulativeFundingRate = buffer.readBigInt64LE(offset);
    const baseAssetAmount = buffer.readBigInt64LE(offset + 8);
    const quoteAssetAmount = buffer.readBigInt64LE(offset + 16);

    // Skip empty positions
    if (baseAssetAmount === 0n && quoteAssetAmount === 0n) {
      offset += 96;
      continue;
    }

    const perpPosition = {
      last_cumulative_funding_rate: lastCumulativeFundingRate,
      base_asset_amount: baseAssetAmount,
      quote_asset_amount: quoteAssetAmount,
      market_index: buffer.readUInt16LE(offset + 92)
    };

    perpPositions.push(perpPosition);
    offset += 96; // Size of PerpPosition struct
  }

  return {
    spotPositions,
    perpPositions
  };
}


function readPublicKeyFromBuffer(buffer, offset) {
  if (!buffer || buffer.length < offset + 32) {
    throw new Error('Buffer is too small to contain a public key at the specified offset');
  }
  const publicKeyBytes = buffer.slice(offset, offset + 32);
  return new PublicKey(publicKeyBytes);
}


async function fetchVaultUserAddressesWithOffset(data, offset) {
  const vaultUserAddresses = [];
  const otherDataArray = [];

  const validData = data.filter(item => {
    try {
      new PublicKey(item.address);
      return true;
    } catch (error) {
      return false;
    }
  });

  const accounts = await getMultipleAccounts(validData.map(item => new PublicKey(item.address)));

  accounts.forEach((account, index) => {
    try {
      const userPublicKey = readPublicKeyFromBuffer(account.data, offset);
      vaultUserAddresses.push(userPublicKey);
    } catch (error) {
      console.error(`Error processing address ${validData[index].address}:`, error);
    }
  });

  return { vaultUserAddresses, otherDataArray };
}

async function fetchVaultAddresses() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/LuckyFutureAi/LuckyFuture-Assets/refs/heads/main/vaults-info.json');
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data.vaults;
  } catch (error) {
    console.error('Error fetching vault addresses:', error);
    throw error;
  }
}


module.exports = { readPublicKeyFromBuffer, deserializeUserPositions, fetchVaultUserAddressesWithOffset, fetchVaultAddresses};

