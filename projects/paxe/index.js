const { staking } = require("../helper/staking")


const PAXE_TOKEN = "0xd2A3eec06719D5Ac66248003B5488E02165dd2fa"
const PAXE_FARMING_CONTRACT = '0xbA576f5ecbA5182a20f010089107dFb00502241f';
const RESTAKING_POOL = '0x269e1ceb128ccCD5684BbAFF9906D69eD1e9e9C8';
async function tvl(api) {
  const paxeBalanceinFarm = await api.call({
    abi: 'erc20:balanceOf',
    target: PAXE_TOKEN,
    params: [PAXE_FARMING_CONTRACT],
  });
      const paxeBalanceinRestake = await api.call({
    abi: 'erc20:balanceOf',
    target: PAXE_TOKEN,
    params: [RESTAKING_POOL],
  });

      api.add(PAXE_TOKEN, paxeBalanceinFarm)
      api.add(PAXE_TOKEN, paxeBalanceinRestake)
}

module.exports = {
      methodology: 'We count the TVL on the PAXE token in the farming contract and the restaking pool',
    
  bsc: {
    tvl,
  }
}; 