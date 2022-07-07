const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const { getBlock } = require("../helper/getBlock");
const { transformPolygonAddress } = require("../helper/portedTokens");

const START_BLOCK = 23813603;
const WHITELIST_START_BLOCK = 28206494;
const WHITELIST_END_BLOCK = 29118036;
const whitelist = "0x9E435A5Cb48aeE2C156a8E541ee645e1c171d012";
const marginPool = "0x30ae5debc9edf60a23cd19494492b1ef37afa56d";
const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

function toAddress(str, skip = 0) {
    return `0x${str.slice(64 - 40 + 2 + skip * 64, 64 + 2 + skip * 64)}`.toLowerCase();
}

module.exports.tvl = async function tvl(timestamp, block, chainBlocks) {  
    let balances = {};
    polygonBlock = await getBlock(timestamp, "polygon", chainBlocks);
    
    if(polygonBlock >= START_BLOCK) {
      const whitelistedCollaterals = await sdk.api.util.getLogs({
        target: whitelist,
        topic: "CollateralWhitelisted(address)",
        keys: [],
        fromBlock: WHITELIST_START_BLOCK,
        toBlock: WHITELIST_END_BLOCK,
        chain: 'polygon',
      })
  
      const balanceCalls = []
      const collaterals = []
      whitelistedCollaterals.output.forEach(async (log) => {
        const collateralAsset = toAddress(log.topics[1]).toLowerCase();
        collaterals.push(collateralAsset);
        balanceCalls.push({
          target: collateralAsset,
          params: marginPool
        })
      });
  
      const transform = await transformPolygonAddress();
      const balanceOfs = await sdk.api.abi.multiCall({
        abi: 'erc20:balanceOf',
        calls: balanceCalls,
        chain: 'polygon',
        block
      })

      sdk.util.sumMultiBalanceOf(balances, balanceOfs, false, transform)

      // Calculate WETH locked
      const wethBalance = (
        await sdk.api.abi.call({
          target: WETH,
          params: marginPool,
          abi:  'erc20:balanceOf',
          polygonBlock,
          chain: 'polygon',
        })
      ).output;
      sdk.util.sumSingleBalance(balances, `polygon:${WETH}`, wethBalance);      
    }
  
    return balances;
  }