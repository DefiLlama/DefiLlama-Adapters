const sdk = require('@defillama/sdk');
const abis = require('../config/abis');
const BigNumber = require('bignumber.js');

const STAKING_POOL_ADDRESS = '0x99E4eA9eF6bf396C49B35FF9478EbB8890aEF581';
const UNI_ETH_NAOS_LP_ADDRESS = '0x9b577e849b128ee1a69144b218e809b8bb98c35d';
const NAOS_ADDRESS = '0x4a615bb7166210cce20e6642a6f8fb5d4d044496';
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const NUSD_3CRV_LP_ADDRESS = '0x67d9eAe741944D4402eB0D1cB3bC3a168EC1764c';
const CRV_ADDRESS = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490';

const DAI_CONTRACT_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
const DAI_CONTRACT_HOLDER = [
  '0x9Ddceb30515eD297C1B72Ff8F848F254104b7A12', // Formation
  '0x3ED6355Ad74605c0b09415d6B0b29a294Fd31265', // Transmuter
];

// yearn V1
const YEARN_VAULT = {
  v1: '0x19d3364a399d251e894ac732651be8b0e4e85001',
  v2: '0xda816459f1ab5631232fe5e97a05bbbb94970c95',
};

const YEARN_ADAPTER = {
  v1: '0xC1802cccc61e671f7c547E9326523edD2f55E84D',
  v2: '0x8394BB87481046C1ec84C39689D402c00189df43',
};

function weiToFloat(wei, decimal = 18) {
  wei = new BigNumber(wei).div(10 ** decimal).toPrecision();
  return parseFloat(wei);
}

function tokenAmountMultiplyPricePerShare(token, pricePerShare, decimal = 18) {
  const tokenFL = weiToFloat(token, decimal);
  const tokenBN = new BigNumber(tokenFL);
  const pricePerShareBN = new BigNumber(pricePerShare);
  return tokenBN.multipliedBy(pricePerShareBN);
}

function sumTwoNumber(token1, token2) {
  const token1BN = new BigNumber(token1);
  const token2BN = new BigNumber(token2);
  return token1BN.plus(token2BN);
}

async function tvl(timestamp, block) {
  let balances = {};
  let YEARN_VAULT_ADDRESS = '';
  let YEARN_ADAPTER_ADDRESS = '';
  if (block < 12983023) {
    YEARN_VAULT_ADDRESS = YEARN_VAULT.v1;
    YEARN_ADAPTER_ADDRESS = YEARN_ADAPTER.v1;
  } else {
    YEARN_VAULT_ADDRESS = YEARN_VAULT.v2;
    YEARN_ADAPTER_ADDRESS = YEARN_ADAPTER.v2;
  }

  // ---- Start DAI and yvDai
  const daiStakeTotalAmount = await sdk.api.abi.multiCall({
    calls: DAI_CONTRACT_HOLDER.map((holder) => {
      return {
        target: DAI_CONTRACT_ADDRESS,
        params: holder, // formation and transmuter
      };
    }),
    abi: 'erc20:balanceOf',
    block: block,
  });

  const { output: yVDaiTotalAmount } = await sdk.api.erc20.balanceOf({
    target: YEARN_VAULT_ADDRESS,
    owner: YEARN_ADAPTER_ADDRESS,
    block: block,
  });
  const { output: yVDaiPricePerShare } = await sdk.api.abi.call({
    target: YEARN_VAULT_ADDRESS,
    abi: abis.abis.minYvV2[1], // pricePerShare
    block,
  });
  const { output: yVDaiDecimal } = await sdk.api.erc20.decimals(YEARN_VAULT_ADDRESS);
  const yvDaiTVL = tokenAmountMultiplyPricePerShare(yVDaiTotalAmount, yVDaiPricePerShare, yVDaiDecimal); // parse yvdai value to dai
  sdk.util.sumMultiBalanceOf(balances, daiStakeTotalAmount, true); // for formation, transmuter dai tvl
  balances[DAI_CONTRACT_ADDRESS] = sumTwoNumber(balances[DAI_CONTRACT_ADDRESS], yvDaiTVL).toFixed(0); // add yvdai tvl with dai
  // ---- End DAI and yvDai

  // ---- Start nUSD-3CRV staking
  let { output: nUSD3CrvAmount } = await sdk.api.erc20.balanceOf({
    target: NUSD_3CRV_LP_ADDRESS,
    owner: STAKING_POOL_ADDRESS,
    block: block,
  });
  sdk.util.sumSingleBalance(balances, CRV_ADDRESS, nUSD3CrvAmount); // treat nUSD-3CRV LP as 3CRV
  // ---- End nUSD-3CRV staking

  return balances;
}

async function pool2(timestamp, block) {
  const balances = {};
  // ---- Start uniswap eth-naos lp
  const { output: uniEthNaosLP } = await sdk.api.abi.call({
    target: UNI_ETH_NAOS_LP_ADDRESS,
    abi: {
      constant: true,
      inputs: [],
      name: 'getReserves',
      outputs: [
        { internalType: 'uint112', name: '_reserve0', type: 'uint112' },
        { internalType: 'uint112', name: '_reserve1', type: 'uint112' },
        {
          internalType: 'uint32',
          name: '_blockTimestampLast',
          type: 'uint32',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    block,
  });

  let uniNAOSTokenAmount = new BigNumber(uniEthNaosLP._reserve0);
  let uniWETHTokenAmount = new BigNumber(uniEthNaosLP._reserve1);

  let { output: uni_NAOS_WETH_LpTotalSupply } = await sdk.api.abi.call({
    target: UNI_ETH_NAOS_LP_ADDRESS,
    abi: abis.abis.minABI[2], // totalSupply
    block,
  });

  uni_NAOS_WETH_LpTotalSupply = new BigNumber(uni_NAOS_WETH_LpTotalSupply);

  let { output: stakingPoolHoldWethNaosLpTotalAmount } = await sdk.api.erc20.balanceOf({
    target: UNI_ETH_NAOS_LP_ADDRESS,
    owner: STAKING_POOL_ADDRESS,
    block: block,
  });

  stakingPoolHoldWethNaosLpTotalAmount = new BigNumber(stakingPoolHoldWethNaosLpTotalAmount);
  const stakedPercentage = stakingPoolHoldWethNaosLpTotalAmount.div(uni_NAOS_WETH_LpTotalSupply);
  const naosStakedAmount = uniNAOSTokenAmount.multipliedBy(stakedPercentage);
  const wethStakedAmount = uniWETHTokenAmount.multipliedBy(stakedPercentage);
  balances[NAOS_ADDRESS] = naosStakedAmount.toFixed(0);
  balances[WETH_ADDRESS] = wethStakedAmount.toFixed(0);

  // ---- End uniswap eth-naos lp
  return balances;
}

async function staking(timestamp, block) {
  const balances = {};
  // ---- Start naos staking
  let { output: naosAmount } = await sdk.api.erc20.balanceOf({
    target: NAOS_ADDRESS,
    owner: STAKING_POOL_ADDRESS,
    block: block,
  });
  sdk.util.sumSingleBalance(balances, NAOS_ADDRESS, naosAmount);
  // ---- End naos staking
  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
  staking: {
    tvl: staking,
  },
  pool2: {
    tvl: pool2,
  },
  tvl,
};
