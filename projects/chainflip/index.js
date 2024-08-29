const { staking } = require('../helper/staking');

const STATE_CHAIN_GATEWAY_CONTRACT = '0x826180541412D574cf1336d22c0C0a287822678A';
const FLIP_TOKEN = '0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd'

const poolsData = JSON.stringify({
    query: `{
        allPools {
            nodes {
                baseAsset
                baseLiquidityAmount
                quoteAsset
                quoteLiquidityAmount
            }
        }
    }`,
});

const boostData = JSON.stringify({
    query: `{
        allBoostPools {
            nodes { 
                asset
                chain
                feeTierPips
                availableAmount
                unavailableAmount
            }
        }
    }`,
});

function renameAsset(asset) {
    switch (asset) {
      case 'Dot':
        return 'coingecko:polkadot';
      case 'Usdc':
        return 'coingecko:usd-coin';
      case 'Flip':
        return 'coingecko:chainflip';
      case 'Btc':
        return 'coingecko:bitcoin';
      case 'Eth':
        return 'coingecko:ethereum';
      case 'Usdt':
        return 'coingecko:tether';
      case 'ArbEth':
        return 'coingecko:ethereum';
      case 'ArbUsdc':
        return 'coingecko:usd-coin';
      default:
        return asset;
    }
}

function assetDecimals(asset) {
    switch (asset) {
      case 'coingecko:polkadot':
        return 10;
      case 'coingecko:usd-coin':
        return 6;
      case 'coingecko:chainflip':
        return 18;
      case 'coingecko:bitcoin':
        return 8;
      case 'coingecko:ethereum':
        return 18;
      case 'coingecko:tether':
        return 6;
      default:
        return 0;
    }
  }

async function tvl(api) {
    await pools_tvl(api);
    await boost_tvl(api);
}

async function pools_tvl(api) {
    // Call GraphQL and get tokens, add each to balance
    const response = await fetch('https://cache-service.chainflip.io/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: poolsData,
      });

    const json = await response.json();

    const assets = json.data.allPools.nodes.reduce((acc, curr) => {
        const baseAsset = renameAsset(curr.baseAsset);
        const existingBaseAsset = acc.find(item => item.asset === baseAsset);
        
        if (existingBaseAsset) {
            existingBaseAsset.liquidityAmount = BigInt(existingBaseAsset.liquidityAmount) + BigInt(curr.baseLiquidityAmount);
        } else {
          acc.push({
            asset: baseAsset,
            liquidityAmount: BigInt(curr.baseLiquidityAmount)
          });
        }
        
        const quoteAsset = renameAsset(curr.quoteAsset);
        const existingQuoteAsset = acc.find(item => item.asset === quoteAsset);
        
        if (existingQuoteAsset) {
            existingQuoteAsset.liquidityAmount = BigInt(existingQuoteAsset.liquidityAmount) + BigInt(curr.quoteLiquidityAmount);
        } else {
          acc.push({
            asset: quoteAsset,
            liquidityAmount: BigInt(curr.quoteLiquidityAmount)
          });
        }

        return acc;
      }, []);

    // console.log(assets);
    assets.forEach(item => {
        const liquidity = BigInt(item.liquidityAmount) / BigInt(10 ** assetDecimals(item.asset));
        // console.log('Adding', liquidity, item.asset);
        api.add(
            item.asset, 
            liquidity, 
            { skipChain: true })
    });
}

async function boost_tvl(api) {
    // Call GraphQL and get tokens, add each to balance
    const response = await fetch('https://cache-service.chainflip.io/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: boostData,
      });

    const json = await response.json();

    const assets = json.data.allBoostPools.nodes.reduce((acc, curr) => {
        const baseAsset = renameAsset(curr.asset);
        const existingBaseAsset = acc.find(item => item.asset === baseAsset);
        
        if (existingBaseAsset) {
            existingBaseAsset.liquidityAmount = BigInt(existingBaseAsset.liquidityAmount) + BigInt(curr.availableAmount) + BigInt(curr.unavailableAmount);
        } else {
          acc.push({
            asset: baseAsset,
            liquidityAmount: BigInt(curr.availableAmount) + BigInt(curr.unavailableAmount)
          });
        }
        
        return acc;
      }, []);

    // console.log(assets);
    assets.forEach(item => {
        const liquidity = BigInt(item.liquidityAmount) / BigInt(10 ** assetDecimals(item.asset));
        // console.log('Adding', liquidity, item.asset);
        api.add(
            item.asset, 
            liquidity, 
            { skipChain: true })
    });
}

module.exports = {
    methodology: 'The number of FLIP tokens in the Chainflip State Chain Gateway Contract, as well as the total deployed liquidity.',
    start: 1700740800, // FLIP went live on 2023-11-23 12:00 UTC
    ethereum: {
        tvl: () => {},
        staking: staking(FLIP_TOKEN, STATE_CHAIN_GATEWAY_CONTRACT),
    },
    chainflip: {
        tvl,
    }
};
