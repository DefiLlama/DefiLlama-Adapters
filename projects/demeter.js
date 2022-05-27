const retry = require('./helper/retry')
const axios = require("axios");
const sdk = require('@defillama/sdk');
const { transformHecoAddress } = require('./helper/portedTokens');
const { unwrapUniswapLPs } = require("./helper/unwrapLPs");
const { getBlock } = require('./helper/getBlock')

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  const transform = await transformHecoAddress();

  let liquidity = (await retry(async bail => 
    await axios.get('https://demeter.xyz/app/api/market_global_data', {
        headers: { 'x-chain-id': '128' }
    }))).data.data.marketList;

  for (let i = 0; i < liquidity.length; i++) {
    sdk.util.sumSingleBalance(
        balances, 
        transform(liquidity[i].assetToken), 
        liquidity[i].availableLiquidity
    );
  };

  return balances;
};

async function staking(timestamp, block, chainBlocks) {
    let balances = {};
    const transform = await transformHecoAddress();
    block = await getBlock(timestamp, 'heco', chainBlocks);

    let liquidity = (await retry(async bail => 
      await axios.get('https://demeter.xyz/app/api/staking_global_data', {
          headers: { 'x-chain-id': '128' }
      }))).data.data;
  
    for (let i = 0; i < liquidity.eip20Pools.length; i++) {
        try {
            await unwrapUniswapLPs(balances, 
                [{ 
                    token: liquidity.eip20Pools[i].stakingToken,
                    balance: liquidity.eip20Pools[i].totalBalance 
                }], 
                block, 
                'heco', 
                transform);

        } catch { 
            sdk.util.sumSingleBalance(
                balances, 
                transform(liquidity.eip20Pools[i].stakingToken), 
                liquidity.eip20Pools[i].totalBalance
            );
        }
    };

    sdk.util.sumSingleBalance(
        balances, 
        transform(liquidity.daoStakingToken), 
        liquidity.globalDaoData.totalBalance
    );

    return balances;
};

// node test.js projects/demeter.js
module.exports = {
    heco: {
        tvl,
        staking
    }
};