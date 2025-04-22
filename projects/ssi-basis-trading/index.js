const abi = {
    "getAssetIDs": "function getAssetIDs() view returns (uint256[])",
    "assetTokens": "function assetTokens(uint256 assetID) view returns (address)"
}

const ASSET_FACTORY_CONTRACT = '0xb04eB6b64137d1673D46731C8f84718092c50B0D';
const USSI_CONTRACT = '0x3a46ed8FCeb6eF1ADA2E4600A522AE7e24D2Ed18';

async function tvl(api) {
  const assetIDs = [19];
  const tokens = await api.batchCall(
    assetIDs.map(assetID => {
      return { abi: abi.assetTokens, target: ASSET_FACTORY_CONTRACT, params: [assetID] };
    })
  );
  tokens.push(USSI_CONTRACT);
  const balances = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens });
  api.add(tokens, balances);
}

// the vaults are here https://github.com/DefiLlama/DefiLlama-Adapters/pull/12893#issuecomment-2577690389

module.exports = {
    methodology: 'TVL counts the Mag7.ssi tokens and USSI tokens minted.',
    start: 23863972,
    base: {
      tvl,
    }
  };