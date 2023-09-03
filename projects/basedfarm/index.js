/* eslint-disable */
const sdk = require('@defillama/sdk');
const axios = require('axios');

const GENESIS_REWARD_POOL = "0x4F4014EC1685699290A311E0A159E1E39914853F";

const AERO = '0x940181a94a35a4569e4529a3cdfb74e38fd98631';
const WETH = '0x4200000000000000000000000000000000000006';
const USDC = '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA';
const CBETH = '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22';
const OGRE = '0xAB8a1c03b8E4e1D21c8Ddd6eDf9e07f26E843492';

const AERO_POOL = '0x15426543176c59d240cc02c65c1da2650d84e492';
const WETH_POOL = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640';
const USDC_POOL = '0x4c36388be6f416a29c8d8eee81c771ce6be14b18';
const CBETH_POOL = '0x10648ba41b8565907cfa1496765fa4d95390aa0d';
const OGRE_POOL = '0x7a4fc8d825dcf5475f117851544daeda8c3e7d28';

const tokens = [AERO, WETH, USDC, CBETH, OGRE];
const pools = [AERO_POOL, WETH_POOL, USDC_POOL, CBETH_POOL, OGRE_POOL];
const decimals = [18, 18, 6, 18, 18];
const apiChain = [base, ethereum, base, base, base];

async function base(chainBlocks) {
  let tvl = 0;

  for (let i = 0; i < tokens.length; i++) {
    const balance = sdk.api.erc20.balanceOf({
      target: tokens[i],
      owner: GENESIS_REWARD_POOL,
      block: chainBlocks['base'],
      chain: 'base',
    });

    const price = await getTokenPrice(pools[i], apiChain[i]);

    tvl += (balance * price) / 10 ** decimals[i];
  }

  return tvl;
}

async function getTokenPrice(poolAddress, chain) {
  const dexscreener = await axios.get(`https://api.dexscreener.com/latest/dex/pairs/${chain}/${poolAddress}`);
  return dexscreener.data.pair.priceUsd;
}

module.exports = {
  methodology:
    'TVL is based on value of the single-sided staked tokens inside of the Genesis reward pool.',
  base:{
    tvl: base
  },
};