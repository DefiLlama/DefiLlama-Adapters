const sdk = require("@defillama/sdk");
const {pool2} = require("../helper/pool2.js");

//Polygon and BSC staking contracts
const polygonContract = "0xefa4aED9Cf41A8A0FcdA4e88EfA2F60675bAeC9F";
const bscContract = "0x1E30E12e82956540bf870A40FD1215fC083a3751";

//Polygon and BSC LPs
const polygonLp = "0xb556feD3B348634a9A010374C406824Ae93F0CF8"
const bscLp = "0x351A295AfBAB020Bc7eedcB7fd5A823c01A95Fda";

let polygonPool2 = pool2(polygonContract, polygonLp, "polygon", addr=>`polygon:${addr}`);
let bscPool2 = pool2(bscContract, bscLp, "bsc", addr=>`bsc:${addr}`);


module.exports = {
    methodology: 'Current value of Yield Farms on both chains',
    polygon: {
        tvl: async ()=>({}),
        pool2: polygonPool2
    },   
    bsc: {
        tvl: async ()=>({}),
        pool2: bscPool2
    },
    tvl: async ()=>({})
}
