const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const antimatterStakingContract = "0xCB8429f22541E8F5cd8ea6c20BFFdcE7cDA65227";
const dualInvestContract = "0x7E45149820Fa33B66DCD3fd57158A0E755A67a16";
const dualInvestManagerAddress = "0x32275702f5A47Dcd89705c1ea4d47E99517b0e1a";
const bscBTCContract = ADDRESSES.bsc.BTCB;
const bscUSDTContract = ADDRESSES.bsc.USDT;
const bscETHContract = ADDRESSES.bsc.ETH;
const kavaUSDTContract = ADDRESSES.moonriver.USDT;
const kavaBTCContract = ADDRESSES.moonriver.USDT;
const kavaDualinvertContract = "0x626B5c394542960faa9495e64E812d17D5B605F9";

const factory = "0x90183C741CC13195884B6E332Aa0ac1F7c1E67Fa";

const usdTokens = {
  bsc: ADDRESSES.bsc.BUSD,
  ethereum: ADDRESSES.ethereum.USDT,
  arbitrum: ADDRESSES.arbitrum.USDT,
  avax: ADDRESSES.avax.USDC_e,
}

const dualInvest = {
  bsc: {
    tokens: [bscUSDTContract, bscBTCContract, bscETHContract,],
    owners: [dualInvestContract,],
  },
  kava: {
    tokens: [kavaUSDTContract, kavaBTCContract,],
    owners: [kavaDualinvertContract,],
  },
}

module.exports = {
  methodology: "Antimatter application is consist of four parts: 1) Antimatter structured product 2) Antimatter Bull and Bear 3) Antimatter Governance staking and 4) antimatter Nonfungible finance . There are assets locked in each part of the application on multiple chains. TVL is counted as the value of the underlying assets in each part of the application’s contract. Our TVL is calling contract from our smart contracts",
};

const chains = Object.keys(usdTokens)
chains.push('kava')

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.ethereum.staking = staking(antimatterStakingContract, '0x9b99cca871be05119b2012fd4474731dd653febe')


async function tvl(api) {
  let toa = []
  const usdToken = usdTokens[api.chain]
  if (usdToken) {
    const puts = await api.fetchList({ lengthAbi: abi.length, itemAbi: abi.allPuts, target: factory })
    const calls = await api.fetchList({ lengthAbi: abi.length, itemAbi: abi.allCalls, target: factory })
    const contracts = [...puts, ...calls]
    toa = contracts.map(i => [usdToken, i])
    const underlyings = await api.multiCall({ abi: abi.underlying, calls: contracts })
    underlyings.forEach((v, i) => toa.push([v, contracts[i]]))
  }

  const { owners = [], tokens = [] } = dualInvest[api.chain] || {}
  if (tokens.length) {
    owners.forEach(o => tokens.forEach(t => toa.push([t, o])))
  }
  return sumTokens2({ api, tokensAndOwners: toa })
}
