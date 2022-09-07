const sdk = require('@defillama/sdk')
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
//const {transformFantomAddress} = require('../helper/portedTokens.js');

const factory = '0xC831A5cBfb4aC2Da5ed5B194385DFD9bF5bFcBa7'
const wigoToken = '0xE992bEAb6659BFF447893641A378FbbF031C5bD6'
const masterFarmer = '0xA1a938855735C0651A6CfE2E93a32A28A236d0E9'

async function tvl(_timestamp, _ethBlock, chainBlocks){
  // const transform = await transformFantomAddress();

  const balances = await calculateUniTvl(addr=>{
    addr = addr.toLowerCase();
    return `fantom:${addr}`;
  }, chainBlocks['fantom'], 'fantom', factory, 28898932, true);
  return balances
}

async function staking(_timestamp, _ethBlock, chainBlocks) {
  const balances = {}
  const stakedWigo = sdk.api.erc20.balanceOf({
    target: wigoToken,
    owner: masterFarmer,
    chain: 'fantom',
    block: chainBlocks.fantom
  })

  sdk.util.sumSingleBalance(balances, 'fantom:' + wigoToken, (await stakedWigo).output)
  return balances
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'The factory address (0xC831A5cBfb4aC2Da5ed5B194385DFD9bF5bFcBa7) is used find the pairs and sum the liquidity of the AMM. Staking accounts for the WIGO locked in MasterFarmer (0xA1a938855735C0651A6CfE2E93a32A28A236d0E9).',
  fantom: {
    staking,
    tvl
  },
}