const { sumTokens2 } = require("../helper/unwrapLPs");


const FARM_ADDRESS = "0x3384D85EC14163a9d35eeAb44261390aafD70f82";
const FARM_IONIC_ADDRESS = "0x8D25067901B637D0eF1DF3163D782d89d53F403A";
const CEL_ADDRESS = "0x8b83ECC4EF8FaEc5c05b7D6EC002B659BE137120";

const BERACHAIN_FARM_ADDRESS = "0xAbFc9bb50af39D1e6f99836Ff2EeCc39778808a1";
const BERACHAIN_CEL_ADDRESS = "0xD3415dCFbdA117814e24a4cbaf61128A4D79b860";
const BERACHAIN_FARM_LP_ADDRESS = "0x5CC7BebF2A05fC4b7F259C8688Ff0d80735E36FE";

async function getTvl(api, farmAddress) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: farmAddress });

  pools
    .forEach((i) => {
      api.add(i.assets, i.tvl);
    });

  return await sumTokens2({ api, resolveLP: true });
}

async function tvl(api) {
  if(api.chain === 'mode'){
    return await getTvl(api,FARM_IONIC_ADDRESS);
  }else{
    await getTvl(api,BERACHAIN_FARM_ADDRESS);
    return await getTvl(api,BERACHAIN_FARM_LP_ADDRESS);
  }
}

async function staking(api) {

  let farmAddress = api.chain === 'berachain'?BERACHAIN_FARM_ADDRESS:FARM_ADDRESS
  let celAddress = api.chain === 'berachain'?BERACHAIN_CEL_ADDRESS:CEL_ADDRESS
  

  let pools = await api.call({ abi: abiInfo.poolTvls, target: farmAddress });
  let target = pools.find((i) => i.assets === celAddress);
  api.add(celAddress, target.tvl);
  return api.getBalances();
}

module.exports = {
  mode: {
    tvl,
    staking,
  },
  berachain:{
    tvl,
    staking
  }
};

const abiInfo = {
  poolTvls:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
};
