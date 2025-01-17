const { treasuryExports } = require("../helper/treasury");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');

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

// https://github.com/DefiLlama/DefiLlama-Adapters/pull/12893#issuecomment-2577690389s
module.exports = treasuryExports({
  ethereum: { owners: ['0x55ac87E54019fa2e2156a0fAf13176DcdDFA16ce', '0x605b50f07f46251a7a39fa18c2247fb612f7452f', '0x3bc6b3146d48fafcfb6be35284295019fbd645e7'], },
  bsc: { owners: [ '0x3bc6b3146d48fafcfb6be35284295019fbd645e7'], },
  doge: { owners: [ 'DPQ3EbacSG6gdakZmXwMu7qS6SbpRUjY4a', 'D5gedqfZm198AyTFVg8NqWFUh8bFTdmKj7'], },
  solana: { owners: ['CeuKmW1XqgKz4E8JNpZxrysMRsvkEz55qUvm9soqhALY', 'GQkn3fPeCV4pH1MGZVHsWPpRdq5ENYnaB8GVwSubjkCZ', '8yVXip9eFwdmrbTxPqHsuCvVR5ktBdLGz7S1bUpSx7j6'] },
  bitcoin: { owners: bitcoinAddressBook.ssiProtocol },
  cardano: { owners: ['addr1v9nkv9p0gz83ha7hx0h6pg6lrte0t0dsj8tyersc8np5gegrwwxpp'] },
  ripple: { owners: ['rp53vxWXuEe9LL6AHcCtzzAvdtynSL1aVM'] },
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
