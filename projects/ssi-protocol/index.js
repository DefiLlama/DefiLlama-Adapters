const { treasuryExports } = require("../helper/treasury");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

const abi = {
    "getAssetIDs": "function getAssetIDs() view returns (uint256[])",
    "assetTokens": "function assetTokens(uint256 assetID) view returns (address)"
}

const ASSET_FACTORY_CONTRACT = '0xb04eB6b64137d1673D46731C8f84718092c50B0D';

async function tvl(api) {
  const assetIDs = [19];
  const tokens = await api.batchCall(
    assetIDs.map(assetID => {
      return { abi: abi.assetTokens, target: ASSET_FACTORY_CONTRACT, params: [assetID] };
    })
  );
  const balances = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens });
  api.add(tokens, balances);
}

// add SSI Protocol TVL adapter by shirc · Pull Request #12893 · DefiLlama/DefiLlama-Adapters
module.exports = treasuryExports({
  ethereum: { owners: ['0x55ac87E54019fa2e2156a0fAf13176DcdDFA16ce', '0x605b50f07f46251a7a39fa18c2247fb612f7452f'], },
  doge: { owners: [ 'DPQ3EbacSG6gdakZmXwMu7qS6SbpRUjY4a'], },
  solana: { owners: ['CeuKmW1XqgKz4E8JNpZxrysMRsvkEz55qUvm9soqhALY', 'GQkn3fPeCV4pH1MGZVHsWPpRdq5ENYnaB8GVwSubjkCZ'] },
});
Object.keys(module.exports).forEach(chain => delete module.exports[chain].ownTokens);

module.exports = {
  ...module.exports,
  methodology: 'TVL counts the SSI tokens and USSI token minted.',
  start: 23863972,
  base: {
    tvl,
  }
};
