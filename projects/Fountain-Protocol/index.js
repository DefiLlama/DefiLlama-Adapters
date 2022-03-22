const {usdCompoundExports} = require('../helper/compound');
const contracts = {  
  oasis: {
    comptroller: '0xA7684aE7e07Dac91113900342b3ef25B9Fd1D841',
    gas:{
      fToken:"0xD7d588bAbFb99E82Cd6dd0cA7677A5599AA678B5",
      decimals:18,
    },
  },
};

const chainExports = {}
Object.entries(contracts).forEach(([chain, chainData])=>{
  chainExports[chain]=usdCompoundExports(chainData.comptroller, chain, chainData.gas.fToken)
})
module.exports={
  timetravel: true,
  ...chainExports,
  methodology: `TVL is comprised of tokens deposited to the protocol as collateral, similar to Compound Finance and the borrowed tokens are not counted as TVL.`
};