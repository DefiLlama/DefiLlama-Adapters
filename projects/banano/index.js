const { pool2BalanceFromMasterChefExports} = require("../helper/pool2.js");
const masterchefAbi = require("../helper/abis/masterchef.json");

//Polygon and BSC staking contracts
const polygonContract = "0xefa4aED9Cf41A8A0FcdA4e88EfA2F60675bAeC9F";
const bscContract = "0x1E30E12e82956540bf870A40FD1215fC083a3751";

const ban = "0xe20B9e246db5a0d21BF9209E4858Bc9A3ff7A034";


module.exports = {
    methodology: 'Pool2 TVL in Polygon and BSC LPs',
    polygon: {
        tvl: async ()=>({}),
        pool2: pool2BalanceFromMasterChefExports(polygonContract, ban, "polygon", addr=>`polygon:${addr}`, masterchefAbi.poolInfo)
    },   
    bsc: {
        tvl: async ()=>({}),
        pool2: pool2BalanceFromMasterChefExports(bscContract, ban, "bsc", addr=>`bsc:${addr}`, masterchefAbi.poolInfo)
    },
    tvl: async ()=>({})
}
