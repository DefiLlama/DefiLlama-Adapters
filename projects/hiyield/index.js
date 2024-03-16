const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");

const NETWORK = {
  AVALANCHE: 'avax',
  CANTO: 'canto'
};

const CONTRACTS = {
  CANTO: {
    hyVWEAX: '0x0E4289a95207CA653b60B0eB0b5848f29F4C3f72'
  },
  AVAX: {
    TREASURY_BILLS: '0x8475509d391e6ee5A8b7133221CE17019D307B3E',
    INVESTMENT_GRADE_BONDS: '0xce6050625fe3F79bBfC4d236aBAaBE51AB59e660'
  }
}

const CANTO_POOLS = Object.values(CONTRACTS.CANTO);
const AVAX_POOLS = Object.values(CONTRACTS.AVAX);



async function getPoolInfo(chain, pools, block) {
  const poolData = [];
  for (const pool of pools) {
    const poolInfo = await sdk.api.abi.call({
      chain,
      block,
      target: pool,
      abi: "function poolInfo() external view returns(uint256, uint256, uint256, uint256, uint256)"
    })
    poolData.push(poolInfo)
  }
  return poolData;
}


async function avax(timestamp, ethBlock, { avax: block }) {
  let sum = new BigNumber(0);
  const poolInfo = await getPoolInfo(NETWORK.AVALANCHE, AVAX_POOLS, block)
  for (const pool of poolInfo) {
    const poolInfo = pool.output;
    const totalValueLocked = poolInfo?.[0];
    sum = sum.plus(BigNumber(totalValueLocked));
  }
  const tvl = sum.div(1e6).toNumber();
  return { usd: tvl }
}

async function canto(timestamp, ethBlock, { canto: block }) {

  const poolInfo = await getPoolInfo(NETWORK.CANTO, CANTO_POOLS, block)

  const totalSupply = await sdk.api.abi.call({
    chain: NETWORK.CANTO,
    block,
    target: CANTO_POOLS[0],
    abi: "uint256:totalSupply"
  });

  const lastDebtTokenValue = poolInfo[0].output[4];
  const tvl = BigNumber(totalSupply.output).div(1e18).toNumber() * (BigNumber(lastDebtTokenValue)).div(1e18).toNumber();
  return { usd: tvl }
}

module.exports = {
  methodology: 'TBD',
  avax: {
    tvl: avax
  },
  canto: {
    tvl: canto
  }
}