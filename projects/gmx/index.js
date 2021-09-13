const sdk = require('@defillama/sdk');

const VAULT = '0x489ee077994B6658eAfA855C308275EAd8097C4A';
const STAKING = '0x908C4D94D34924765f1eDc22A1DD098397c59dD4';
const GMX = '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a';
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const WBTC = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f';
const USDC = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8';

async function tvl(time, _ethBlock, chainBlocks) {
    let balances = {};

    balances['gmx'] = await balanceOf(GMX, STAKING, chainBlocks);
    balances['weth'] = await balanceOf(WETH, VAULT, chainBlocks);
    balances['wrapped-bitcoin'] = await balanceOf(WBTC, VAULT, chainBlocks);
    balances['usd-coin'] = await balanceOf(USDC, VAULT, chainBlocks);

    return balances;
}

async function balanceOf(pTarget, pParam, pChainBlocks) {
    let decimals = await sdk.api.abi.call({
        target: pTarget,
        abi: 'erc20:decimals',
        block: pChainBlocks.arbitrum,
        chain: 'arbitrum'
    });
    let result = await sdk.api.abi.call({
      target: pTarget,
      params: pParam,
      abi: 'erc20:balanceOf',
      block: pChainBlocks.arbitrum,
      chain: 'arbitrum'
    });
    return result.output*Math.pow(10, -decimals.output);
}

module.exports = {
    arbitrum:{
        tvl,
    },
  tvl
};