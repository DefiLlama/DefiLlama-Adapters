const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js').default;
const abi = require('./config/wepiggy/abi.json');

const contracts = {
  ethereum: {
    comptroller: '0x0C8c1ab017c3C0c8A48dD9F1DB2F59022D190f0b',
    oracle: '0xe212829Ca055eD63279753971672c693C6C6d088',
    gas:{
      pToken:"0x27A94869341838D5783368a8503FdA5fbCd7987c",
      decimals:18,
    },
  },
  okexchain: {
    comptroller: '0xaa87715e858b482931eb2f6f92e504571588390b',
    oracle: '0x4c78015679fabe22f6e02ce8102afbf7d93794ea',
    gas:{
      pToken:"0x621ce6596e0b9ccf635316bfe7fdbc80c3029bec",
      decimals:18,
    },
  },
  bsc: {
    comptroller: '0x8c925623708A94c7DE98a8e83e8200259fF716E0',
    oracle: '0x4C78015679FabE22F6e02Ce8102AFbF7d93794eA',
    gas:{
      pToken:"0x33A32f0ad4AA704e28C93eD8Ffa61d50d51622a7",
      decimals:18,
    },
  },
  polygon: {
    comptroller: '0xFfceAcfD39117030314A07b2C86dA36E51787948',
    oracle: '0x4C78015679FabE22F6e02Ce8102AFbF7d93794eA',
    gas:{
      pToken:"0xC1B02E52e9512519EDF99671931772E452fb4399",
      decimals:18,
    },
  },
  heco: {
    comptroller: '0x3401D01E31BB6DefcFc7410c312C0181E19b9dd5',
    oracle: '0x4C78015679FabE22F6e02Ce8102AFbF7d93794eA',
    gas:{
      pToken:"0x75DCd2536a5f414B8F90Bb7F2F3c015a26dc8c79",
      decimals:18,
    },
  },
};

// ask comptroller for all markets array
async function getAllMarkets(block, chain, comptroller) {
  const { output: markets } = await sdk.api.abi.call({
    target: comptroller,
    abi: abi['getAllMarkets'],
    block,
    chain: chain,
  });
  return markets;
}

async function getUnderlyingDecimals(block, chain, token) {
  // if (token === '0x27A94869341838D5783368a8503FdA5fbCd7987c') {
  //   return { underlying: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 }; //pETH => WETH
  // }
  if (token.toLowerCase() === contracts[chain].gas.pToken.toLowerCase()) {
    return contracts[chain].gas.decimals;
  }

  const { output: underlying } = await sdk.api.abi.call({
    target: token,
    abi: abi['underlying'],
    block,
    chain: chain,
  });
  const { output: decimals } = await sdk.api.abi.call({
    target: underlying,
    abi: abi['decimals'],
    block,
    chain: chain,
  });
  return decimals;
}

async function getUnderlyingPrice(block, chain, oracle, token) {
  const { output: underlyingPrice } = await sdk.api.abi.call({
    target: oracle,
    abi: abi['getUnderlyingPrice'],
    block,
    params: [token],
    chain: chain,
  });
  return underlyingPrice;
}

async function getCash(block, chain, token) {
  const { output: cash } = await sdk.api.abi.call({
    target: token,
    abi: abi['getCash'],
    block,
    chain: chain,
  });
  return cash;
}

function fetchChain(chain) {
  return async () => {
    let tvl = new BigNumber('0');
    let { comptroller, oracle } = contracts[chain];
    let block = null;
    // const { block } = await sdk.api.util.lookupBlock(timestamp, {
    //   chain: chain,
    // });
    let allMarkets = await getAllMarkets(block, chain, comptroller);

    await Promise.all(
      allMarkets.map(async token => {
        let cash = new BigNumber(await getCash(block, chain, token));
        let decimals = await getUnderlyingDecimals(block, chain, token);
        let locked = cash.div(10 ** decimals);
        let underlyingPrice = new BigNumber(await getUnderlyingPrice(block, chain, oracle, token)).div(
          10 ** (18 + 18 - decimals)
        );
        tvl = tvl.plus(locked.times(underlyingPrice));
      })
    );
    return tvl.toNumber();
  };
}

async function fetch() {
  let tvl =
    (await fetchChain('ethereum')()) +
    (await fetchChain('okexchain')()) +
    (await fetchChain('bsc')()) +
    (await fetchChain('polygon')()) +
    (await fetchChain('heco')());
  return tvl;
}

module.exports = {
  ethereum: {
    fetch: fetchChain('ethereum'),
  },
  okexchain: {
    fetch: fetchChain('okexchain'),
  },
  bsc: {
    fetch: fetchChain('bsc'),
  },
  polygon: {
    fetch: fetchChain('polygon'),
  },
  heco: {
    fetch: fetchChain('heco'),
  },
  fetch,
  methodology: `TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.`
};
