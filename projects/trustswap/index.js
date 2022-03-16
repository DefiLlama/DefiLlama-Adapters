const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { transformBscAddress, transformPolygonAddress, transformAvaxAddress } = require("../helper/portedTokens");

const tokens = {
  'polygon': '0x3809dcdd5dde24b37abe64a5a339784c3323c44f',
  'avax': '0xc7b5d72c836e718cda8888eaf03707faef675079',
  'bsc': '0x82443a77684a7da92fdcb639c8d2bd068a596245',
  'ethereum': '0xcc4304a31d09258b0029ea7fe63d032f52e44efe'
};
const stakingContracts = {
  'polygon': '0xb16a2a990a4EAdB677505fdF5bdb299f703fce25',
  'avax': '0x405eF38d44ACfF35b293410fEF9d8de1369Bece4',
  'bsc': '0x1714FBCFb62A4974C83EaFA0fAEC12191da6c71e',
  'ethereum': '0x5A753021CE28CBC5A7c51f732ba83873D673d8cC'
};

const assets = [
  // other tokens which probably for some reason was sent to the contract accidentally
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
];
async function bscTvl(timestamp, block, chainBlocks) {
  return stakingTvl({}, 'bsc', 'bsc', chainBlocks, await transformBscAddress());
};
async function polygonTvl(timestamp, block, chainBlocks) {
  return stakingTvl({}, 'polygon', 'polygon', chainBlocks, await transformPolygonAddress());
};
async function ethTvl(timestamp, block, chainBlocks) {
  return stakingTvl({}, 'ethereum', 'ethereum', chainBlocks);
};
async function avaxTvl(timestamp, block, chainBlocks) {
  return stakingTvl({}, 'avax', 'avax', chainBlocks, await transformAvaxAddress());
};
async function stakingTvl(balances, chain, miner, chainBlocks, transform=a=>a) {
  try {
    const balance = (await sdk.api.abi.call({
      target: stakingContracts[miner],
      chain: chain,
      block: chainBlocks[chain],
      abi: abi.currentTotalStake
    })).output;
    await sdk.util.sumSingleBalance(balances, transform(tokens[miner]), balance);
    if (chain === 'ethereum') {
      for (let i = 0; i < assets.length; i++) {
        const assetsBalance = (
          await sdk.api.abi.call({
            abi: erc20.balanceOf,
            target: assets[i],
            params: stakingContracts[miner],
            block: chainBlocks[chain],
          })
        ).output;

        await sdk.util.sumSingleBalance(balances, assets[i], assetsBalance);
      }
    }
  } catch (error) {
    console.log(error);
  }
  return balances;
};

module.exports = {
  ethereum: {
      tvl: ethTvl,
  },
  bsc: {
      tvl: bscTvl,
  },
  polygon: {
      tvl: polygonTvl,
  },
  avalanche: {
      tvl: avaxTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl, bscTvl, polygonTvl, avaxTvl]),
};
