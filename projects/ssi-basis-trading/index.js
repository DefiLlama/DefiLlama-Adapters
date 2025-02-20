const abi = {
  "getAssetIDs": "function getAssetIDs() view returns (uint256[])",
  "assetTokens": "function assetTokens(uint256 assetID) view returns (address)"
}

const ASSET_FACTORY_CONTRACT = '0xb04eB6b64137d1673D46731C8f84718092c50B0D';
const USSI_CONTRACT = '0x3a46ed8FCeb6eF1ADA2E4600A522AE7e24D2Ed18';

async function tvl(api) {
// Only track USSI, exclude MAG7.ssi
const tokens = [USSI_CONTRACT];

// Fetch the total supply for USSI only
const balances = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens });

// Add only USSI to the balances
api.add(tokens, balances);
}

module.exports = {
  methodology: 'TVL counts only the USSI tokens minted.',
  start: 23863972,
  base: {
    tvl,
  }
};
