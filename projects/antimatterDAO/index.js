const abi = require("./abi.json");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const antimatterStakingContract = "0xCB8429f22541E8F5cd8ea6c20BFFdcE7cDA65227";
const dualInvestContract = "0x7E45149820Fa33B66DCD3fd57158A0E755A67a16";
const dualInvestManagerAddress = "0x32275702f5A47Dcd89705c1ea4d47E99517b0e1a";
const bscBTCContract = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const bscUSDTContract = "0x55d398326f99059fF775485246999027B3197955";
const bscETHContract = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const kavaUSDTContract = "0xB44a9B6905aF7c801311e8F4E76932ee959c663C";
const kavaBTCContract = "0xB44a9B6905aF7c801311e8F4E76932ee959c663C";
const kavaDualinvertContract = "0x626B5c394542960faa9495e64E812d17D5B605F9";

const factory = "0x90183C741CC13195884B6E332Aa0ac1F7c1E67Fa";

const usdTokens = {
  bsc: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  ethereum: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  avax: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
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


async function tvl(_, _1, _2, { api }) {
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
