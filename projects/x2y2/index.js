const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/chainlink.json");
const { staking } = require("../helper/staking");
const { nftPriceFeeds, tokens } = require('../helper/tokenMapping');

// Example X2Y2 staking tx: X2Y2 staking goes from wallet to X2Y2 FeeSharingSystem then to the 0xb329 TokenDistributor contract
// https://etherscan.io/token/0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9?a=0xb329e39ebefd16f40d38f07643652ce17ca5bac1#readContract
const X2Y2 = "0x1e4ede388cbc9f4b5c79681b7f94d36a11abebc9";
const X2Y2_staking = "0xb329e39ebefd16f40d38f07643652ce17ca5bac1";

// Lending vault
const XY3 = "0xC28F7Ee92Cd6619e8eEC6A70923079fBAFb86196";

async function getTVL(balances, chain, timestamp, chainBlocks) {
  // Get deposited collateral
  const { output: positions } = await sdk.api.abi.multiCall({
      calls: nftPriceFeeds[chain].map((priceFeed) => ({
          target: priceFeed.token, params: [XY3]
      })),
      abi: "erc20:balanceOf",
      block: chainBlocks[chain],
      chain,
  });

  // Get floor prices from Chainlink feeds
  const { output: floorPrices } = await sdk.api.abi.multiCall({
      calls: nftPriceFeeds[chain].map((priceFeed) => ({
          target: priceFeed.oracle,
      })),
      abi: abi.latestAnswer,
      block: chainBlocks[chain],
      chain,
  });

  let collateralValueETH = 0;
  for (let i = 0; i < positions.length; i++) {
      const floorPrice = floorPrices[i].output;
      const position = Number(positions[i].output);
      collateralValueETH += position * floorPrice;
  }

  sdk.util.sumSingleBalance(balances, tokens.weth, collateralValueETH);
  return balances;
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  await getTVL(balances, "ethereum", timestamp, chainBlocks);
  return balances;
}

module.exports = {
  methodology: `TVL for X2Y2 consists of deposited NFTs`,
  ethereum:{
    tvl,
    staking: staking(X2Y2_staking, X2Y2, "ethereum"), 
  }
}