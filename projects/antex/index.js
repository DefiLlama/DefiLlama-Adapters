const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const { staking } = require("../helper/staking.js");
const {getLiquityTvl} = require('../helper/liquity')
const {pool2Exports} = require("../helper/pool2");

const TOKEN_CONTRACT = '0xCA1aCAB14e85F30996aC83c64fF93Ded7586977C';
const DEX_ADDRESS_PAIR_CONTRACT = '0x39B8A10735D1055C8313B1b0732A1c205f4E7635';


async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'bsc',
    target: TOKEN_CONTRACT,
    params: [DEX_ADDRESS_PAIR_CONTRACT],
    block: chainBlocks['bsc'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(TOKEN_CONTRACT), collateralBalance)

  return balances;
}


module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  bsc: {
    tvl,
  }
}; 

