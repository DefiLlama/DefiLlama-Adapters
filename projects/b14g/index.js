const EARN_RATE_BASE = (1000000)
const { ethers } = require("ethers");



const coreProvider = new ethers.JsonRpcProvider('https://rpc.coredao.org');

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)"
];

const EARN_ABI = [
  "function getCurrentExchangeRate() view returns (uint256)" 
];

const STAKING_ABI = [
  "function totalDelegatedStCore() view returns (uint256)"
];


const LRTToken = '0xc8Ab6db5a5176B28B205c3de24934C548032Ca90';
const Earn = '0xf5fA1728bABc3f8D2a617397faC2696c958C3409';
const Staking = '0x788CC33E9365d8b4F8dEcEF9AeDf5F5fdcDb664B';


const getStakedTVL = async (api) => {
  const { chain } = api
  let totalCOREInEther = 0;
  if(chain === 'core'){
    
    const contract = new ethers.Contract(Staking, STAKING_ABI, coreProvider);
    const earnContract = new ethers.Contract(Earn, EARN_ABI, coreProvider);
    const rate = await earnContract.getCurrentExchangeRate()
    const totalLRT = await contract.totalDelegatedStCore();

    const totalLRTInEther = parseFloat(ethers.formatUnits(totalLRT, 18));
    totalCOREInEther = totalLRTInEther / EARN_RATE_BASE * Number(rate)

    // console.log(`Core Token Total Supply (in ether): ${totalCOREInEther}`);

  }
  api.addUSDValue(totalCOREInEther)
}

module.exports = {
  core: {
    tvl: () => ({}),
    staking: getStakedTVL
  },
}








