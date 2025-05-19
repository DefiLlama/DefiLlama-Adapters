//
//    /$$      /$$   /$$$$$$   /$$      /$$  /$$$$$$  /$$   /$$  /$$$$$$$$
//   | $$$    /$$$  /$$__  $$ | $$$    /$$$ |_  $$_/ | $$$ | $$ |__  $$__/
//   | $$$$  /$$$$ | $$  \ $$ | $$$$  /$$$$   | $$   | $$$$| $$    | $$   
//   | $$ $$/$$ $$ | $$  | $$ | $$ $$/$$ $$   | $$   | $$ $$ $$    | $$   
//   | $$  $$$| $$ | $$  | $$ | $$  $$$| $$   | $$   | $$  $$$$    | $$   
//   | $$\  $ | $$ | $$  | $$ | $$\  $ | $$   | $$   | $$\  $$$    | $$   
//   | $$ \/  | $$ |  $$$$$$/ | $$ \/  | $$  /$$$$$$ | $$ \  $$    | $$   
//   |__/     |__/  \______/  |__/     |__/ |______/ |__/  \__/    |__/   
//
// 
//     Adapter for the Momint marketplace on Lisk/OP stack
//     This adapter calculates TVL for the Momint marketplace
//     TVL is calculated as the sum of all listings with valid, 
//     verifyable on chain sale data

// required constants
const { ethers } = require("ethers");
const MARKETPLACE_ADDRESS = "0xb50b1dC8Ba1a4491cC6f18BCEd73101e4ABc7A7f";
const MARKETPLACE_ABI = [
  "event ListingCreated(uint256 indexed listingId, address indexed nftContract, address indexed seller, address listedBy, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken)",
  "event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 totalPrice)",
  "event ListingCancelled(uint256 indexed listingId)",
  "function listings(uint256) view returns (address nftContract, address seller, address listedBy, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken, bool active)"];
const LISK_TOKEN="0xac485391EB2d7D88253a7F1eF18C37f4242D1A24"
const CHAIN = "lisk";
const START_BLOCK_LISK = 13782903;
const RPC_URL = "https://rpc.api.lisk.com/";

// TVL function
async function tvl(timestamp) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
  const blockNumber = await provider.getBlockNumber(); // Get latest block number

  const marketplaceFilter = marketplace.filters.ListingSold();// filter transactions with valid payments
  const events = await marketplace.queryFilter(marketplaceFilter, START_BLOCK_LISK, blockNumber).catch(e => {
    console.error(`Error querying ListingSold events:`, e.message);
    return [];
  });

  // setup tally variables
  let totalVolumeInLSK = 0;
  let totalValidSaleEvents = 0;

  // loop through the events
  for (const event of events) {
    console.log(`Processing event: #${totalValidSaleEvents}/${events.length}`);
    totalValidSaleEvents++; // Tally up the number of valid sales with price data
    const { listingId, totalPrice } = event.args; // Get metadata from the contract event
    let listing = await marketplace.listings(listingId); // Get the listing data from the contract
    const priceInTokens = Number(totalPrice) / Number(BigInt(10) ** BigInt(18)); // LSK has 18 decimals
    if(listing.paymentToken.toLowerCase() === LISK_TOKEN.toLowerCase()) totalVolumeInLSK += priceInTokens; //ignore other currencies for now
  }
  return { [CHAIN]: totalVolumeInLSK }; //return total LSK volume
}

module.exports = {
  methodology: "Calculates TVL as the USD value of all listings in the Momint marketplace, based on pricePerToken * remaining amount for each listing.",
  misrepresentedTokens: false,
  timetravel: true,
  start: 13782903,
  [CHAIN]: { tvl },
  hallmarks: [[Date.parse("2025-03-12") / 1000, "Momint Marketplace Lisk / OP Stack Launch"]],
};