const sdk = require('@defillama/sdk');
const qaostakeContract = "0x053b759c880b69075a52e4374efa08e6b5196ad0"
const qao = "0x3402e15b3ea0f1aec2679c4be4c6d051cef93953"

async function stakingTvl(timestamp, block) {
let balances = {};

const qaoTVL = await sdk.api.erc20.balanceOf({
  target: qao,
  owner: qaostakeContract,
  block: block 
});


balances[qao] = qaoTVL.output;


return balances;
}

module.exports = {
ethereum:{
  staking: stakingTvl,
  tvl: () => ({})
},
}