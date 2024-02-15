const sdk = require('@defillama/sdk');
const axios = require('axios');
const BigNumber = require('bignumber.js');
const { stakings } = require('../helper/staking');


const arbitrumChain = 'arbitrum';
const ethereumChain = 'ethereum';
const stakingContract = '0x0bD623E8150918b4252a1df407B914250AcE4CC6';
const senToken = '0x154388a4650D63acC823e06Ef9e47C1eDdD3cBb2';
const marketLensContracts = {
  [arbitrumChain]: '0x5c6cBA80e5FA3c8D9FD53F17d6F5a7A2EDb5fC8C',
  [ethereumChain]: '0x9cae6d5a09E4860AfCD1DF144250dd02A014DF15',
};
const chamberAddresses = [
  { address: '0x2d99E1116E73110B88C468189aa6AF8Bb4675ec9', chain: arbitrumChain },
  { address: '0x4D7b1A1900b74ea4b843a5747740F483152cbA5C', chain: arbitrumChain },
  { address: '0x7C160FfE3741a28e754E018DCcBD25dB04B313AC', chain: arbitrumChain },
  { address: '0xBC83F2711D0749D7454e4A9D53d8594DF0377c05', chain: ethereumChain }
];

async function getSENPriceUSD() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=seneca&vs_currencies=usd');
    return BigNumber(response.data.seneca.usd);
  } catch (error) {
    console.error('Error fetching SEN price from CoinGecko:', error);
    return BigNumber(0);
  }
}

async function chainTVL(chain, block, chainBlocks) {
  let tvl = BigNumber(0);
  const senPriceUSD = await getSENPriceUSD();

  for (const chamber of chamberAddresses.filter(c => c.chain === chain)) {
    const totalCollateral = await sdk.api.abi.call({
      target: marketLensContracts[chamber.chain],
      abi: {"inputs":[{"internalType":"address","name":"market","type":"address"}],"name":"getTotalCollateral","outputs":[{"internalType":"uint256","name":"totalCollateral","type":"uint256"},{"internalType":"uint256","name":"totalPrincipal","type":"uint256"}],"stateMutability":"view","type":"function"},
      params: [chamber.address],
      block: chainBlocks[chamber.chain],
      chain,
    });
    const collateralValue = BigNumber(totalCollateral.output[1] || 0).dividedBy(1e18).toFixed(0);
    
    tvl = tvl.plus(collateralValue);
  }

  return { 'usd': tvl.toFixed(0) };
}

module.exports = {
    methodology: 'Counts the TVL of SEN tokens staked in the staking contracts and the total collateral in chambers across Arbitrum and Ethereum.',
    arbitrum: {
        tvl: async (timestamp, ethBlock, chainBlocks) => {
        const arbitrumTVL = await chainTVL(arbitrumChain, ethBlock, chainBlocks);
        const stakingTVL = await stakings([stakingContract], senToken, arbitrumChain)(timestamp, ethBlock, chainBlocks);
        
        const totalTVL = BigNumber(arbitrumTVL['usd']).plus(stakingTVL['usd'] || 0).toFixed(0);
        
        return { 'usd': totalTVL };
    },
    staking: stakings([stakingContract], senToken, arbitrumChain),
    },
    ethereum: {
        tvl: async (timestamp, ethBlock, chainBlocks) => await chainTVL(ethereumChain, ethBlock, chainBlocks),
    },
};



