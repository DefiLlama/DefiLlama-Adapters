const sdk = require('@defillama/sdk');
const axios = require("axios")

const abi = require('./abi.json');

const { getBlock } = require('../helper/getBlock');
const retry = require("../helper/retry");

const LP_WETH_GENE_ADDRESS = '0x3d4219987fBb25C3DcF73FbD9AA85FbE3C7411D9';
const WETH_ADDRESS = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';

async function tvl(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, 'polygon', chainBlocks, true)
    const token0 = (
        await sdk.api.abi.call({
            target: LP_WETH_GENE_ADDRESS,
            abi: abi.token0,
            block: block,
            chain: 'polygon',
        })
    ).output;

    const getReserves = (
        await sdk.api.abi.call({
            target: LP_WETH_GENE_ADDRESS,
            abi: abi.getReserves,
            block: block,
            chain: 'polygon',
        })
    ).output;

    let reserveAmount = 0;

    if (WETH_ADDRESS == token0) {
        reserveAmount = getReserves[0];
    } else {
        reserveAmount = getReserves[1];
    }
    let price_feed = await retry(
        async (bail) =>
          await axios.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
          )
      );
    
    const result = Number(reserveAmount * price_feed.data.ethereum.usd * 2) / (10 ** 18);

    return {'tether': result};
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'TVL Calculation for GenomesDAO',
    polygon: {
      tvl
    },
  }; 