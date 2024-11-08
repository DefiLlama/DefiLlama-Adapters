const {publicKey, u8, u16, u64, struct, } = require('./layout-base')

// Define the Fee layout
const FeeLayout = [
  u16('redemptionFeeBps'),
  u64('redemptionFeeAccumulated'),
  u16('managementFeeBps'),
  u64('managementFeeLastUpdate'),
  u64('managementFeeAccumulated'),
  u16('performanceFeeBps'),
]

// Define the Asset layout
const AssetLayout = struct([
  u16('assetId'),
  publicKey('mint'),
  u8('decimals'),
  publicKey('ata'),
  publicKey('oracle'),
]);

// Define the StrategyRecord layout
const StrategyRecordLayout = struct([
  u16('strategyId'),
  u16('assetId'),
  u64('balance'),
  u64('netEarnings'),
]);

// Define the Vault layout
const VaultLayout = struct([
  publicKey('authority'),
  publicKey('shares'),
  struct(FeeLayout, 'fee'),
  u8('paused'),
  u16('assetIndex'),
  u16('strategyIndex'),
]);

// Function to decode the Vault data
function decodeCarrotVault(buffer) {
  const data = VaultLayout.decode(buffer.slice(8));
  let offset = VaultLayout.span + 12

  // Decode the assets array
  data.assets = [];
  for (let i = 0; i < data.assetIndex; i++) {
    data.assets.push(AssetLayout.decode(buffer, offset));
    offset += AssetLayout.span;
  }

  // Decode the strategies array
  data.strategies = [];
  for (let i = 0; i < data.strategyIndex; i++) {
    data.strategies.push(StrategyRecordLayout.decode(buffer, offset));
    offset += StrategyRecordLayout.span;
  }

  return data;
}

module.exports = {
  decodeCarrotVault,
};