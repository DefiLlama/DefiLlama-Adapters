const { transformBalances } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require('../helper/masterchef');
const STAKING_CONTRACT_ARBITRUM = "0x6b614684742717114200dc9f30cBFdCC00fc73Ec";
const STAKING_CONTRACT_IOTEX = "0x9B4CF5d754455fD3Bc4212DCFF1b085DBCd5b0c0";

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await addFundsInMasterChef(
      balances, STAKING_CONTRACT_ARBITRUM, chainBlocks.arbitrum, 'arbitrum', i => i);
  delete balances['0x2c852d3334188be136bfc540ef2bb8c37b590bad'];
  delete balances['0x2c852D3334188BE136bFC540EF2bB8C37b590BAD'];

  return transformBalances('arbitrum', balances)
};

const iotexTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    
    await addFundsInMasterChef(
        balances, STAKING_CONTRACT_IOTEX, chainBlocks.iotex, 'iotex', i => i);
    return transformBalances('iotex', balances)
};

module.exports={
    timetravel: true, //no archive node
    arbitrum: {
        tvl: arbitrumTvl
    },
    iotex: {
        tvl: iotexTvl
    },
}
