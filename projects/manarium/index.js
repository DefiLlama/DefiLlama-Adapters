const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const ARI_TOKEN_CONTRACT = '0xc80a0a55caf6a7bfb4ee22f9380c4077312c4a35';
const ARI_STAKING_CONTRACT = '0x0C3542f48D26CF67e2DAc78f5588D12649F4D255';

async function tvl(timestamp, block, chainBlocks){
    const balances = {};
    const transform = await transformBscAddress();

    const collateralBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: 'bsc',
        target: ARI_TOKEN_CONTRACT,
        params: [ARI_STAKING_CONTRACT],
        block: chainBlocks['bsc'],
      })).output;

      sdk.util.sumSingleBalance(balances, transform(ARI_TOKEN_CONTRACT), collateralBalance)
      return balances;
}

module.exports = {
    bsc: {
      tvl: () => ({}),
      staking: tvl
    }
  }; 