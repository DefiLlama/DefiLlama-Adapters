const { get } = require("../helper/http")
const abi = {
    "getProviderBalance": "function getProviderBalance(address provider) view returns (uint128 balance, uint128 totalCap)"
  };
const ADDRESSES = require('../helper/coreAssets.json')

let _response

const config = {
  ethereum: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
  avax: '0xc3344870d52688874b06d844E0C36cc39FC727F6',
  bsc: '0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827',
  fantom: '0xcfc785741dc0e98ad4c9f6394bb9d43cd1ef5179',
  flow: '0x1b97100eA1D7126C4d60027e231EA4CB25314bdb',
}

async function getTvls(serviceName, key) {
  if (!_response) _response = get('https://api.staking.ankr.com/v1alpha/metrics')
  const response = await _response
  const data = response.services.find(i => i.serviceName === serviceName)
  return data ? +data[key] : 0;
}

async function getonChainTvl(api) {
  const token = config[api.chain]
  const ethSupply = await api.call({ abi: 'erc20:totalSupply', target: token })
  const ratio = await api.call({ abi: 'uint256:ratio', target: token })
  const ethTvl = ethSupply / (ratio / 1e18)

  if (api.chain === 'flow')
    api.add(ADDRESSES.flow.WFLOW, ethTvl)
  else
    api.addGasToken(ethTvl)

  if (api.chain === 'ethereum') {
    const aMatic = '0x26dcfbfa8bc267b250432c01c982eaf81cc5480c'
    const maticSupply = await api.call({ abi: 'erc20:totalSupply', target: aMatic })
    const ratio = await api.call({ abi: 'uint256:ratio', target: aMatic })
    api.add(ADDRESSES.ethereum.MATIC, maticSupply / (ratio / 1e18))
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

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: getonChainTvl }
})