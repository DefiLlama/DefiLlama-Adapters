const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const solana = require('../helper/solana')
const { stakings } = require('../helper/staking');

const stakingContractRoundOne = '0x8d9Ae5a2Ecc16A66740A53Cc9080CcE29a7fD9F5';
const stakingContractRoundTwo =  '0xa96cdb86332b105065ca99432916e631e469cf5d';
const stakingContractRoundThree =  '0x3333B155fa21A972D179921718792f1036370333';
const stakingToken = '0x8e3bcc334657560253b83f08331d85267316e08a'; // BRBC token (bsc)

const pools = {
  bsc: '0x70e8C8139d1ceF162D5ba3B286380EB5913098c4',
  ethereum: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
  polygon:'0xeC52A30E4bFe2D6B0ba1D0dbf78f265c0a119286',
  fantom: '0xd23B4dA264A756F427e13C72AB6cA5A6C95E4608',
  avax: '0x541eC7c03F330605a2176fCD9c255596a30C00dB',
  harmony: '0x5681012ccc3ec5bafefac21ce4280ad7fe22bbf2',
  moonriver: '0xD8b19613723215EF8CC80fC35A1428f8E8826940',
  arbitrum: '0x5F3c8d58A01Aad4f875d55E2835D82e12f99723c',
  aurora: '0x55Be05ecC1c417B16163b000CB71DcE8526a5D06',
  solana: 'DrmQS74dx5yDPzAJdGpVMqpSkVP9RXFQnMQAdeo1P7mj',
  kava: '0x333b8881485fB8dE9af05d0B259a7f3f032B3333'
};

const usdcByChain = {
  bsc: ADDRESSES.bsc.USDC,
  ethereum: ADDRESSES.ethereum.USDC,
  polygon: ADDRESSES.polygon.USDC,
  fantom: ADDRESSES.fantom.USDC,
  avax: ADDRESSES.avax.USDC_e,
  harmony: '0x985458e523db3d53125813ed68c274899e9dfab4',
  moonriver: ADDRESSES.moonriver.USDC,
  arbitrum: ADDRESSES.arbitrum.USDC,
  aurora: ADDRESSES.aurora.USDC_e,
  solana: ADDRESSES.solana.USDC,
  kava: ADDRESSES.telos.ETH
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];
    const balances = {};
    const poolBalance = await sdk.api.erc20.balanceOf({
      target: usdcByChain[chain], owner: pools[chain], block, undefined, chain
    });

    sdk.util.sumSingleBalance(balances, chain+':'+usdcByChain[chain], poolBalance.output);

    return balances;
  }
}

function solanaTvl() {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const poolBalance = await solana.getTokenBalance(usdcByChain['solana'], pools['solana']);

    sdk.util.sumSingleBalance(balances, 'usd-coin', poolBalance);

    return balances;
  }
}

module.exports = {
  timetravel: false, // solana :cries:
  methodology: 'Staking pool balance',
  bsc: {
    tvl: () => ({}),
    staking: stakings([stakingContractRoundOne, stakingContractRoundTwo, stakingContractRoundThree, ], stakingToken),
  },
  hallmarks:[
    [1655991120, "Horizon bridge Hack $100m"],
  ],
  kava: {
    tvl: chainTvl('kava')
  }
  // ethereum: {
  //   tvl: chainTvl('ethereum')
  // },
  // polygon: {
  //   tvl: chainTvl('polygon')
  // },
  // fantom: {
  //   tvl: chainTvl('fantom')
  // },
  // avax:{
  //   tvl: chainTvl('avax')
  // },
  // harmony: {
  //   tvl: chainTvl('harmony')
  // },
  // moonriver: {
  //   tvl: chainTvl('moonriver')
  // },
  // arbitrum: {
  //   tvl: chainTvl('arbitrum')
  // },
  // aurora: {
  //   tvl: chainTvl('aurora')
  // },
  // solana: {
  //   tvl: solanaTvl()
  // }
}
