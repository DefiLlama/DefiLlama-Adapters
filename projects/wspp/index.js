const utils = require('../helper/utils');
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
async function fetch() {
    const response = await utils.fetchURL('https://wolfible.com/api?q=kardiatvl');
    //console.log(response.data)
    let total = Number(response.data)
    let tvl = total;
    return tvl;
};

const WSPP_KAI_MASTERCHEF = "0x2f78685a7930C7A8288fE489a67d8E35a2029D89"
const WSPP_KAI_KAIDEX = "0x2ce428D8E137d0184078655043b0094608197a40";
const WSPP_KAI_BECO = "0xA89552968Fc159F10abc82b5521f8Ec23939aad8";
const WSPP = "0x5197FBE1a86679FF1360E27862BF88B0c5119BD8";

async function kardiaStaking(timestamp, ethBlock, chainBlocks) { 
  const balances = {}

  const {output: lpBalances} = await sdk.api.abi.multiCall({
    calls: [
      {target: WSPP_KAI_KAIDEX, params: WSPP_KAI_MASTERCHEF},
      {target: WSPP_KAI_BECO, params: WSPP_KAI_MASTERCHEF},
    ],
    abi: 'erc20:balanceOf',
    block: chainBlocks['kardia'],
    chain: 'kardia'
  })
  const lpPositions = lpBalances.map(t => ({
    token: t.input.target,
    balance: t.output,
  }))
  const transform = addr => {
    if (addr.toLowerCase() === WSPP.toLowerCase()) {
      return WSPP
    } else {
      return 'kardia:' + addr
    }
  }
  await unwrapUniswapLPs(balances, lpPositions, chainBlocks['kardia'], 'kardia', transform)

  return balances
}



module.exports = {
  kardia:{
    staking: kardiaStaking,
    fetch
  },
  fetch
};