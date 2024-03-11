const { pool2BalanceFromMasterChefExports} = require("../helper/pool2.js");
const masterchefAbi = require("../helper/abis/masterchef.json");

//BSC staking contracts
const bscContract = "0x944dFb7f7caB8bbA2F74882784742C39b8495F5e";

const maduck = "0xb976d9684412f75f7AeE24E56D846fd404b1B329";


module.exports = {
    methodology: 'Pool2 TVL BSC LPs',
    bsc: {
        tvl: async ()=>({}),
        pool2: pool2BalanceFromMasterChefExports(bscContract, maduck, "bsc", addr=>`bsc:${addr}`, masterchefAbi.poolInfo)
    },
}


