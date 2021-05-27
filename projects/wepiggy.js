const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js').default;
const abi = require('./config/wepiggy/abi.json');
const utils = require('./helper/utils');

const contracts = {
  ethereum: {
    comptroller: '0x0C8c1ab017c3C0c8A48dD9F1DB2F59022D190f0b',
    oracle: '0xe212829Ca055eD63279753971672c693C6C6d088',
  },
  okexchain: {
    comptroller: '0xaa87715e858b482931eb2f6f92e504571588390b',
    oracle: '0x4c78015679fabe22f6e02ce8102afbf7d93794ea',
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
  if (token.toLowerCase() === '0x27A94869341838D5783368a8503FdA5fbCd7987c'.toLowerCase()) {
    return 18; //ETH
  }
  if (token.toLowerCase() === '0x621ce6596e0b9ccf635316bfe7fdbc80c3029bec'.toLowerCase()) {
    return 18; //OKT
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
  }
}

async function fetch() {
  let tvl = (await fetchChain('ethereum')()) + (await fetchChain('okexchain')())
  return tvl;
}
fetch().then(console.log)

module.exports = {
  ethereum:{
    fetch: fetchChain('ethereum')
  },
  okexchain:{
    fetch: fetchChain('okexchain')
  },
  fetch,
};
