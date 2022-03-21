const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const PEX_TOKEN_CONTRACT = '0x6a0b66710567b6beb81A71F7e9466450a91a384b';
const BUSD_TOKEN_CONTRACT = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
const USDT_TOKEN_CONTRACT = '0x55d398326f99059ff775485246999027b3197955';
const USDC_TOKEN_CONTRACT = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
const LP_TOKEN_CONTRACT = '0x5ca96E8bDe0Bc587DaC9e02422Fd205b1102DAa4';
const STAKING_POOL_CONTRACT = '0x8dBEe838605Df41D947a6634a041A02C74C813b0';
const TREASURY_ADDRESS = '0x2CcF6beEa31e2e68A84117C131cCD1d0acBA6353';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  async function sumBalance(token) {
    const collateralBalance = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: 'bsc',
      target: token,
      params: [TREASURY_ADDRESS],
      block: chainBlocks['bsc'],
    })).output;
    await sdk.util.sumSingleBalance(balances, transform(token), collateralBalance);
  }

  await sumBalance(BUSD_TOKEN_CONTRACT);
  await sumBalance(USDT_TOKEN_CONTRACT);
  await sumBalance(USDC_TOKEN_CONTRACT);

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of LP tokens in the staking pool contract and assets in the treasury address.',
  start: 15966251, // Mar-11-2022 01:00:01 PM +UTC
  bsc: {
    tvl,
    staking: staking(TREASURY_ADDRESS, PEX_TOKEN_CONTRACT, "bsc"),
    pool2: pool2(STAKING_POOL_CONTRACT, LP_TOKEN_CONTRACT, 'bsc')
  }
}; 