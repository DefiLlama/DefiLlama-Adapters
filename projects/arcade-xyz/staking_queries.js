const axios = require('axios');
const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');

const { CHAIN, STAKING_REWARDS, SINGLE_SIDED_STAKING, ARCD, ARCD_WETH_LP, WETH } = require('./staking_constants');
const SINGLE_SIDED_STAKING_ABI = require("./staking_abi_single_sided.json");


async function getTokenPriceInUSD(tokenId) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`);
        if (response.data && response.data[tokenId] && response.data[tokenId].usd) {
            return response.data[tokenId].usd;
        }
        throw new Error(`Price for token ID ${tokenId} not found`);
    } catch (error) {
        console.error(`Error fetching price for token ID ${tokenId}: ${error}`);
        return 0;
    }
}

async function getTotalSupply(contractAddress, contractAbi, block) {
  const totalSupply = (
    await sdk.api.abi.call({
      target: contractAddress,
      abi: contractAbi.find((fn) => fn.name === "totalSupply"),
      chain: CHAIN,
      block: block,
    })
  ).output;

  return totalSupply;
}

async function addToTVL(block, chainBlocks) {
  const balances = {};

  // handle LP token unwrapping and get the total supply for STAKING_REWARDS
  await sumTokensAndLPsSharedOwners(
    balances,
    [[ARCD_WETH_LP, true]],
    [STAKING_REWARDS],
    chainBlocks[CHAIN],
    CHAIN,
    null,
    {
      resolveLP: true,
      unwrapLps: true
    }
  );

  // normalize keys
  const normalizedARCDKey = `${CHAIN}:${ARCD}`.toLowerCase();
  const normalizedWETHKey = `${CHAIN}:${WETH}`.toLowerCase();

  // fetch prices in USD
  const wethPriceInUSD = await getTokenPriceInUSD('weth');
  const arcdPriceInUSD = await getTokenPriceInUSD('arcade-protocol');

  // convert balances to USD
  if (balances[normalizedARCDKey] !== undefined) {
    console.log("StakingRewards ARCD balance:", balances[normalizedARCDKey]);
    balances[normalizedARCDKey] = (balances[normalizedARCDKey] / 1e18) * arcdPriceInUSD;
    console.log("StakingRewards ARCD balance in USD:", balances[normalizedARCDKey]);
    } else {
        console.log("No ARCD balance found");
    }

    if (balances[normalizedWETHKey] !== undefined) {
        console.log("StakingRewards WETH balance:", balances[normalizedWETHKey]);
        balances[normalizedWETHKey] = (balances[normalizedWETHKey] / 1e18) * wethPriceInUSD;
        console.log("StakingRewards WETH balance in USD:", balances[normalizedWETHKey]);
    } else {
        console.log("No WETH balance found");
  }

  // get the SINGLE_SIDED_STAKING total supply
  const totalSupplySingleSided = await getTotalSupply(SINGLE_SIDED_STAKING, SINGLE_SIDED_STAKING_ABI, block);
  console.log("SingleSidedStaking ARCD balance:", totalSupplySingleSided);
  // convert it to USD
  const totalSupplySingleSidedUSD = (totalSupplySingleSided / 1e18) * arcdPriceInUSD;
  console.log("SingleSidedStaking ARCD balance in USD:", totalSupplySingleSidedUSD);
  // add it to the balances
  sdk.util.sumSingleBalance(balances, `${CHAIN}:${SINGLE_SIDED_STAKING}`, totalSupplySingleSidedUSD);

  return balances;
}

async function stakingTvl(timestamp, block, chainBlocks) {
  return await addToTVL(block, chainBlocks);
}

module.exports = {
  stakingTvl
};