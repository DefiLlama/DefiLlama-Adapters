const { sumTokens2 } = require("../helper/unwrapLPs.js");

//Polygon and BSC staking contracts
const polygonContract = "0xefa4aED9Cf41A8A0FcdA4e88EfA2F60675bAeC9F";
const bscContract = "0x1E30E12e82956540bf870A40FD1215fC083a3751";

const ban = "0xe20B9e246db5a0d21BF9209E4858Bc9A3ff7A034";


module.exports = {
    methodology: 'Pool2 TVL in Polygon and BSC LPs',
    polygon: {
        tvl: async ()=>({}),
        pool2: tvl,
    },   
    bsc: {
        tvl: async ()=>({}),
        pool2: tvl,
    },
}

async function tvl(api) {
  const contract = api.chain === 'bsc' ? bscContract : polygonContract;
  const tokens = await api.fetchList({  lengthAbi: 'poolLength', itemAbi:'function poolInfo(uint256) view returns (address stakingToken , uint256 stakingTokenTotalAmount , uint256 accWBANPerShare , uint32 lastRewardTime , uint16 allocPoint )' , target: contract})
  return sumTokens2({ api, tokens: tokens.map(i => i.stakingToken), owner: contract, resolveLP: true})
}   