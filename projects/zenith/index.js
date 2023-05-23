const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2"); 

const contracts = require("./contracts.json");

var pool2= [contracts.ZTHETHPairV2];
var stakeTokens=[];
contracts.stakePools.forEach(r=> {if(r.asset!=contracts.ZTHETHPairV2) stakeTokens.push(r.asset) }); 

 
module.exports = {
  methodology:
    "TVL is comprised of tokens deposited to Zenith protocol as collateral, similar to Compound Finance and other lending protocols the borrowed tokens are not counted as TVL.",
  ethereum: {
    pool2: pool2s([contracts.masterChef], pool2),
    tvl: stakings([contracts.masterChef], stakeTokens),
  },
};
