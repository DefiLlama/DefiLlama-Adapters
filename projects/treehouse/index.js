const ADDRESSES = require('../helper/coreAssets.json')

const IAU_tETH = '0x1B6238E95bBCABEE58997c99BaDD4154ad68BA92'

async function ethTvl(api) {
    const iauSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: IAU_tETH,
    });
  
    api.add( ADDRESSES.ethereum.WSTETH, iauSupply)
  }
  

module.exports = {
    methodology: 'Staked tokens are counted as TVL based on the chain that they are staked on and where the liquidity tokens are issued.',
    start: 1725926400, // Tuesday, September 10, 2024 12:00:00 AM
    ethereum: {
      tvl: ethTvl,
    }
  }; 