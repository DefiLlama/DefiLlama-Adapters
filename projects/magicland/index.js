const sdk = require("@defillama/sdk");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require('../helper/masterchef');
const IOTEX_CG_MAPPING = require("./iotex_coingecko_mapping.json")
const STAKING_CONTRACT_ARBITRUM = "0x6b614684742717114200dc9f30cBFdCC00fc73Ec";
const STAKING_CONTRACT_IOTEX = "0x9B4CF5d754455fD3Bc4212DCFF1b085DBCd5b0c0";

function compareAddresses(a, b){
    return a.toLowerCase() === b.toLowerCase()
}

async function transformIotexAddress() {
    return (addr) => {
        const dstToken = Object.keys(IOTEX_CG_MAPPING).find(token => compareAddresses(addr, token))
        if (dstToken !== undefined) {
            return IOTEX_CG_MAPPING[dstToken].contract || IOTEX_CG_MAPPING[dstToken].coingeckoId
        }
        return `iotex:${addr}`; 
    }
}

function fixIotexBalances(balances){
    for(const representation of ["game-fantasy-token", 'metanyx', 'imagictoken']){
        if(balances[representation] !== undefined){
            balances[representation] = Number(balances[representation])/1e18
        }
    }
}

const arbitrumTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformArbitrumAddress();

  await addFundsInMasterChef(
      balances, STAKING_CONTRACT_ARBITRUM, chainBlocks.arbitrum, 'arbitrum', transformAddress);
  delete balances['0x2c852d3334188be136bfc540ef2bb8c37b590bad'];
  delete balances['0x2c852D3334188BE136bFC540EF2bB8C37b590BAD'];

  return balances;
};

const iotexTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const transformAddress = await transformIotexAddress();
    
    await addFundsInMasterChef(
        balances, STAKING_CONTRACT_IOTEX, chainBlocks.iotex, 'iotex', transformAddress);

    fixIotexBalances(balances);

    return balances;
};

module.exports={
    arbitrum: {
        tvl: arbitrumTvl
    },
    iotex: {
        tvl: iotexTvl
    },
    tvl: sdk.util.sumChainTvls([arbitrumTvl, iotexTvl]),
}