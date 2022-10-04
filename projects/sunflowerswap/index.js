

const { getChainTransform } = require('../helper/portedTokens')
const { addFundsInMasterChef } = require('../helper/masterchef')

const MASTER_CONTRACT = '0x1b9df08EF60800D2B7b8a909589246e18E809797'

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const chain = 'moonbeam'
  const transformAddress = await getChainTransform(chain);
  await addFundsInMasterChef(balances, MASTER_CONTRACT, chainBlocks[chain], chain, transformAddress);
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  timetravel: true,
  incentivized: true,
  moonbeam: { tvl, },
}
