const sdk = require("@defillama/sdk");
const ABI = require("./abi.json")

const CHAIN = "ethereum";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const COMPTROLLER = "0xf9c70750bF615dE83fE7FF62D30C7faACD8f8Ba0";
const LENS = "0x2C4A503Bce0805C357D961e45b55BEEE073188E7";

// Fetches all markets from Comptroller
async function getAllMarkets() {
  const cTokenMarkets = (await sdk.api.abi.call({
    target: COMPTROLLER,
    params: [],
    abi: ABI['getAllMarkets'],
    chain: CHAIN
  })).output;
  return cTokenMarkets
}

// Fetches metdata for all markets
async function getCtokenMetadata(markets) {
  const cTokenMetadatas = (await sdk.api.abi.call({
    target: LENS,
    params: [markets],
    abi: ABI['cTokenMetadataAll'],
    chain: CHAIN
  })).output;
  return cTokenMetadatas
}

// Fetches balance of an asset for a given address
async function getBalance(assetAddress, subjectAddress) {
  const underlyingBalance = (await sdk.api.abi.call({
    target: assetAddress,
    params: [subjectAddress],
    abi: ABI["balanceOf"],
    chain: CHAIN
  })).output;
  return underlyingBalance
}

async function tvl(timestamp, block, _, { api }) {

  const provider = sdk.getProvider(CHAIN);
  const markets = await getAllMarkets()
  const cTokenMetadatas = await getCtokenMetadata(markets)

  // Iterates through each market's metadata aggregating the TVL
  for(const cTokenMetaData of cTokenMetadatas) {

    const cTokenAddress = cTokenMetaData.cToken;
    const underlyingAsset = cTokenMetaData.underlyingAssetAddress;
    const marketType = cTokenMetaData.marketType;
    let underlyingBalance = 0

    // Erc20 Market and Erc20InterestMarket
    if (marketType == 1 || marketType == 3) {
      if (underlyingAsset == ZERO_ADDRESS) { // Native Token
        underlyingBalance = await provider.getBalance(cTokenAddress);
      } else {
        underlyingBalance = await getBalance(underlyingAsset, cTokenAddress)
      }
    // Erc721 Market
    } else if (marketType == 2) {
      underlyingBalance = await getBalance(underlyingAsset, cTokenAddress)
    }

    // Adds balance of underlying asset
    api.add(underlyingAsset, underlyingBalance)
  }
}

module.exports = {
  methodology: 'Aggregates the underlying assets contained in all Fungify Pool Markets',
  ethereum: {
      tvl
  }
}