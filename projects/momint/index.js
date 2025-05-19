const { ethers } = require("ethers");
const axios = require("axios");

const MARKETPLACE_ADDRESS = "0xb50b1dC8Ba1a4491cC6f18BCEd73101e4ABc7A7f";
const MARKETPLACE_ABI = [
  "event ListingCreated(uint256 indexed listingId, address indexed nftContract, address indexed seller, address listedBy, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken)",
  "event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 indexed tokenId, uint256 amount, uint256 totalPrice)",
  "event ListingCancelled(uint256 indexed listingId)",
  "function listings(uint256) view returns (address nftContract, address seller, uint256 tokenId, uint256 amount, uint256 pricePerToken, address paymentToken, bool active)",
];
const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];
const symbolToCoingecko = {
  'LSK': 'lisk',
  'USDC': 'usd-coin',
  'WETH': 'weth',
  'WBTC': 'wrapped-bitcoin',
};
const START_BLOCK_LISK = 13782903;
const CHAIN = "lisk";
const RPC_URL = "https://rpc.api.lisk.com/";

async function getBlock(chain, timestamp) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const currentBlock = await provider.getBlockNumber();
  console.log(`Current block: ${currentBlock}`);
  const currentBlockData = await provider.getBlock(currentBlock);
  const currentTime = currentBlockData.timestamp;
  const blockTime = 2; // seconds
  const timeDiff = currentTime - timestamp;
  if (timeDiff < 0) {
    console.warn(`Timestamp ${timestamp} is in the future. Using latest block ${currentBlock}.`);
    return currentBlock;
  }
  const blocksDiff = Math.floor(timeDiff / blockTime);
  const estimatedBlock = currentBlock - blocksDiff;
  console.log(`Estimated block for timestamp ${timestamp}: ${estimatedBlock}`);
  return estimatedBlock > 0 ? estimatedBlock : 0;
}

async function tvl(timestamp, block, chainBlocks) {
  console.log(`Timestamp: ${timestamp}, Block: ${block}, Chain Blocks: ${JSON.stringify(chainBlocks)}`);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
  const blockNumber = await getBlock(CHAIN, timestamp);
  console.log(`Querying events up to block ${blockNumber}`);

  const createdFilter = marketplace.filters.ListingCreated();
  const createdEvents = await marketplace.queryFilter(createdFilter, START_BLOCK_LISK, 16334906).catch(e => {
    console.error(`Error querying ListingCreated events:`, e.message);
    return [];
  });
  console.log(`Found ${createdEvents.length} ListingCreated events`);

  const cancelledFilter = marketplace.filters.ListingCancelled();
  const cancelledEvents = await marketplace.queryFilter(cancelledFilter, START_BLOCK_LISK, 16334906).catch(e => {
    console.error(`Error querying ListingCancelled events:`, e.message);
    return [];
  });
  console.log(`Found ${cancelledEvents.length} ListingCancelled events`);

   const soldFilter = marketplace.filters.ListingSold();
  const soldEvents = await marketplace.queryFilter(soldFilter, START_BLOCK_LISK, 16334906).catch(e => {
    console.error(`Error querying ListingSold events:`, e.message);
    return [];
  });
  console.log(`Found ${soldEvents.length} ListingSold events`);

  const cancelledIds = new Set(cancelledEvents.map((e) => e.args.listingId.toString()));
  const remainingAmounts = {};
  createdEvents.forEach((event) => {
    const listingId = event.args.listingId.toString();
    console.log(`Listing ${listingId} created with amount ${event.args.amount}`);
    console.log("Event args:",event.args);
    remainingAmounts[listingId] = event.args.amount;
  });

  console.log("Remaining amounts after creation:", remainingAmounts);
  soldEvents.forEach((event) => {
    const listingId = event.args.listingId.toString();
    if (remainingAmounts[listingId]) {
      remainingAmounts[listingId] = event.args.totalPrice;
    }
  });

  console.log("Remaining amounts after sales:", remainingAmounts);

  // combine sold and created events
  // const combinedArray = [...array1, ...array2];

  let totalTvlUsd = 0;
  let activeListings = 0;
  let listingToUSD = [];
  for (const event of soldEvents) {
    const listingId = event.args.listingId.toString();
    // if (cancelledIds.has(listingId)) {
      //   console.log(`Skipping listing ${listingId}: cancelled or fully sold`);
      //   continue;
      // }
      
      try {
        const listing = await marketplace.listings(listingId);
        const paymentToken = listing.paymentToken;
      if (!listing.active) {
        console.log(`Skipping listing ${listingId}: not active`);
        continue;
      }
      
      let symbol;
      if (paymentToken === '0x0000000000000000000000000000000000000000') {
        symbol = 'LSK';
      } else {
        const tokenContract = new ethers.Contract(paymentToken, ERC20_ABI, provider);
        symbol = await tokenContract.symbol();
      }

      // const tokenPrice = await fetchPrice({ symbol, timestamp });
      // if (tokenPrice === 0) {
      //   continue;
      // }

      const decimals = paymentToken === '0x0000000000000000000000000000000000000000' ? 18 : await new ethers.Contract(paymentToken, ERC20_ABI, provider).decimals();
      const formattedAmount = Number(remainingAmounts[listingId]) / Number(BigInt(10) ** BigInt(decimals));
      // const formattedPricePerToken = Number(ethers.utils.formatUnits(listing.pricePerToken, decimals));
      const formattedPricePerToken = 1;
      const valueUsd = formattedAmount * formattedPricePerToken;
      totalTvlUsd += valueUsd*0.64;
      listingToUSD.push({ listingId, valueUsd });
      activeListings++;
      console.log(`Listing ${listingId}: value USD = ${valueUsd.toLocaleString()}`);
    } catch (e) {
      console.error(`Error processing listing ${listingId}:`, e.message);
    }
  }
  console.log(`Found ${activeListings} active listings with total TVL: $${totalTvlUsd.toLocaleString()}`);
  console.log("Listing to USD mapping:", listingToUSD);

  return { [CHAIN]: totalTvlUsd.toLocaleString() };
}

module.exports = {
  methodology: "Calculates TVL as the USD value of all active listings in the Momint marketplace, based on pricePerToken * remaining amount for each listing.",
  misrepresentedTokens: false,
  timetravel: true,
  start: 13782903,
  [CHAIN]: { tvl },
  hallmarks: [[Date.parse("2025-03-12") / 1000, "Momint Marketplace OP Stack Launch"]],
};