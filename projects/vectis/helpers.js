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

module.exports = { deserializeUserPositions };