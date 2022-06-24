const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { transformMilkomedaAddress } = require('../helper/portedTokens');

const abi = require('./abi.json');


const REGISTRY_CONTRACT = '0x83E384d119adA05195Caca26396B8f56fdDA1c91';
const MANUAL_POOL_CONTRACT = '0xA4f0e3C80C77b347250B9D3999478E305FF814A4';
// temporary solution using BLUES/ADA price
const BLUESHIFT_INDEX_PORTFOLIO = '0xB2A76Ce2D5eD32aD7F8B93a1098C1Fee473e27bA';


async function staking(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformMilkomedaAddress();

  const value = (await sdk.api.abi.call({
    abi: abi.BlueshiftEarning.getAccDeposit,
    chain: 'milkomeda',
    target: MANUAL_POOL_CONTRACT,
    params: [],
    block: chainBlocks['milkomeda'],
  })).output;

  const tokenAddress = (await sdk.api.abi.call({
    abi: abi.BlueshiftEarning.getToken,
    chain: 'milkomeda',
    target: MANUAL_POOL_CONTRACT,
    params: [],
    block: chainBlocks['milkomeda'],
  })).output;


  // temporary solution using BLUES/ADA price
  const portfolios = (await sdk.api.abi.call({
    abi: abi.BlueshiftRegistry.getPortfolios,
    chain: 'milkomeda',
    target: REGISTRY_CONTRACT,
    params: [],
    block: chainBlocks['milkomeda'],
  })).output;

  const bluesPortfolio = portfolios.filter(portfolio => portfolio.contractAddress === BLUESHIFT_INDEX_PORTFOLIO)[0];
  if (!bluesPortfolio) {
    return balances;
  }

  const baseTokenAddress = bluesPortfolio.baseTokenAddress;
  const baseTokenPrice = bluesPortfolio.tokens.filter(token => token.tokenAddress === baseTokenAddress)[0].price;
  const tokenPrice = bluesPortfolio.tokens.filter(token => token.tokenAddress === tokenAddress)[0].price;
  const valueInBaseToken = BigNumber(value).multipliedBy(tokenPrice).div(baseTokenPrice);

  await sdk.util.sumSingleBalance(balances, transform(baseTokenAddress), valueInBaseToken.toNumber());
  // ----------------------------------------

  // CoinGecko solution
  // await sdk.util.sumSingleBalance(balances, transform(tokenAddress), value);

  return balances;
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformMilkomedaAddress();

  const portfolios = (await sdk.api.abi.call({
    abi: abi.BlueshiftRegistry.getPortfolios,
    chain: 'milkomeda',
    target: REGISTRY_CONTRACT,
    params: [],
    block: chainBlocks['milkomeda'],
  })).output;

  for (let portfolio of portfolios) {
    const value = portfolio.totalValue;
    await sdk.util.sumSingleBalance(balances, transform(portfolio.baseTokenAddress), value);
  }

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'Accumulates TVL of all Blueshift portfolios calculated in base tokens. Adds TVL of BLUES tokens staked in Blueshift yield pools.',
  start: 2023331,
  milkomeda: {
    staking,
    tvl
  }
};
