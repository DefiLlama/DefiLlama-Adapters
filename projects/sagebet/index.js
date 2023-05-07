const { ethers } = require('ethers');
const sdk = require('@defillama/sdk');
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType } = require('@uniswap/sdk');
const { request, gql } = require('graphql-request');
const { JsonRpcProvider } = require('@ethersproject/providers');
const provider = new JsonRpcProvider('https://arb1.arbitrum.io/rpc');

const MarketFactoryAbi = require('./MarketFactory.json');
const erc20Abi = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    type: "function",
  },
];
const MARKET_FACTORY_CONTRACT = '0xd350c2B3D8EB1de65Cfa68928EA135EdA88326B6';
const USDC_ADDRESS = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'.toLowerCase();
const USDC_CHECKSUM_ADDRESS = ethers.utils.getAddress(USDC_ADDRESS);

async function tvl(timestamp, block, chainBlocks, { api }) {
  const balances = {};
  const provider = api.provider;
  const Contract = new ethers.Contract(MARKET_FACTORY_CONTRACT, MarketFactoryAbi, provider);
  const [marketAddrs] = await Contract.getAllActiveMarkets();

  for (const marketAddress of marketAddrs) {
    const usdcContract = new ethers.Contract(USDC_CHECKSUM_ADDRESS, erc20Abi, provider);
    const collateralBalance = await usdcContract.balanceOf(marketAddress);
    await sdk.util.sumSingleBalance(balances, USDC_CHECKSUM_ADDRESS, collateralBalance.toString(), api.chain);
  }

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Counts the ether balance in all active markets.",
  start: 1000235,
  arbitrum: {
    tvl,
  },
};