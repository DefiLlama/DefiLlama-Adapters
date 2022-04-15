const sdk = require('@defillama/sdk');
const { transformMilkomedaAddress } = require('../helper/portedTokens');

const abi = require('./abi.json');


const MILKOMEDA_BLUES_ADDRESS = '0x8c008BBA2Dd56b99f4A6aB276bE3a478cB075F0C';
const REGISTRY_COTRACT = '0xf7B767D4817a912b5dB7De7747DE2E2960BEF86f';


async function staking(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformMilkomedaAddress();

  const value = (await sdk.api.abi.call({
    abi: abi.BlueshiftRegistry.getManualYieldPoolTotalStaked,
    chain: 'milkomeda',
    target: REGISTRY_COTRACT,
    params: [],
    block: chainBlocks['milkomeda'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(MILKOMEDA_BLUES_ADDRESS), value);

  return balances;
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformMilkomedaAddress();

  const portfolios = (await sdk.api.abi.call({
    abi: abi.BlueshiftRegistry.getPortfolios,
    chain: 'milkomeda',
    target: REGISTRY_COTRACT,
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
