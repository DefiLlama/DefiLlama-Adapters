const { pool2Exports } = require("../helper/pool2.js");

//Polygon and BSC staking contracts
const polygonContract = "0xefa4aED9Cf41A8A0FcdA4e88EfA2F60675bAeC9F";
const bscContract = "0x1E30E12e82956540bf870A40FD1215fC083a3751";

const polygonPool2 = [
    "0xb556feD3B348634a9A010374C406824Ae93F0CF8" // wBAN-wETH SUSHI 
];
const bscPool2 = [
    "0x6011c6BAe36F2a2457dC69Dc49068a1E8Ad832DD", // wBAN-wBNB ApeSwap
    "0x7898466CACf92dF4a4e77a3b4d0170960E43b896", // wBAN-BUSD ApeSwap
    "0x351A295AfBAB020Bc7eedcB7fd5A823c01A95Fda" // wBAN-BUSD Pancake
];


module.exports = {
    methodology: 'Current value of Yield Farms on both chains',
    polygon: {
        tvl: async ()=>({}),
        pool2: pool2Exports(polygonContract, polygonPool2, "polygon", addr=> `polygon:${addr}`)
    },   
    bsc: {
        tvl: async ()=>({}),
        pool2: pool2Exports(bscContract, bscPool2, "bsc", addr=>`bsc:${addr}`)
    },
    tvl: async ()=>({})
}
