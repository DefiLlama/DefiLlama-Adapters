const sdk = require('@defillama/sdk')

const SURE = "0xcb86c6a22cb56b6cf40cafedb06ba0df188a416e"
const contract = "0xF4b2aa60Cd469717857a8A4129C3dB9108f54D74"
const currentTvlAbi = {"inputs":[],"name":"currentTVL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
async function tvl(time, block){
    return {
        [SURE]:(await sdk.api.abi.call({
            target: contract,
            block,
            abi: currentTvlAbi
        })).output
    }
}


module.exports = {
  name: "inSure DeFi",
  token: "SURE",
  category: "Insurance",
  start: 1513566671, // 2020/10/21 6:34:47 (+UTC)
  tvl,
};

