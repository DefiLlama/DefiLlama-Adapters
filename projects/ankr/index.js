const { get } = require("../helper/http")
const abi = require("./abi.json");

let _response

async function getTvls(serviceName, key) {
  if (!_response) _response = get('https://api.staking.ankr.com/v1alpha/metrics')
  const response = await _response
  const data = response.services.find(i => i.serviceName === serviceName)
  return data ? +data[key] : 0;
}

async function getETHTvl() {
  return {
    ethereum: await getTvls("eth", "totalStaked"),
    'matic-network': await getTvls("polygon", "totalStaked"),
  }
}

async function getBscTvl() {
  return {
    binancecoin: await getTvls("bnb", "totalStaked"),
  }
}

async function getAvaxTvl() {
  return {
    'avalanche-2': await getTvls("avax", "totalStaked"),
  }
}

async function polkadot() {
  return {
    polkadot: await getTvls("dot", "totalStaked"),
  }
}

async function ksm() {
  return {
    kusama: await getTvls("ksm", "totalStaked"),
  }
}

async function getFantomTvl() {
  return {
    fantom: await getTvls("ftm", "totalStaked"),
  }
}

async function getGnosisTvl(api) {
  
  //Current Ankr Provider Address, there is a hard cap on how much mGNO each address can stake, other addresses might appear*/
  const ankrProviderAddress = "0x4069D8A3dE3A72EcA86CA5e0a4B94619085E7362"
  
  //Staking Pool Proxy Contract
  const proxyStakingPool = "0xfd0f61255913825da1c194b985f04982966c34d6"
  
  //Staking Pool Logic Contract = "0xb6fcfcc497271d837c050ec912004bca0d70db0f"
  //Provider Registry Proxy Contract  = "0x8a2f83347f0e59faefe2320b7422f8aa432ce27a"
  //Provider Registry Logic Contract = "0x6c6f910a79639dcc94b4feef59ff507c2e843929"


    var providerBalance = (await api.call({
      abi: abi.getProviderBalance,
      target: proxyStakingPool,
      params: [ankrProviderAddress],
    }))

    //providerBalance = [balance, totalCap]
    var staked = providerBalance[0] / 1e18

    //Staked amount is in mGNO, 32 mGNO = 1 GNO
    var trueStaked = staked / 32

    return {
      gnosis: trueStaked
    }
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: getETHTvl,
  },
  bsc: {
    tvl: getBscTvl,
  },
  avax:{
    tvl: getAvaxTvl,
  },
  fantom: {
    tvl: getFantomTvl,
  },
  polkadot: {
    tvl: polkadot,
  },
  kusama: {
    tvl: ksm,
  },
  xdai: {
    tvl: getGnosisTvl,
  },
  methodology: `We get the total staked amount and total staked USD from Ankr's official API. Gnosis: Gets staked amount from the staking pool.`,
};
