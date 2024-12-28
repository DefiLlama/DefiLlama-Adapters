const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const config = {
  ethereum: '0x5FA0060FcfEa35B31F7A5f6025F0fF399b98Edf1',
  bsc: '0xE52cCf7B6cE4817449F2E6fA7efD7B567803E4b4',
  fantom: '0xb8baf2195BfC67845049f49af9d4858F7D9c2b30',
  polygon: '0xd956dEd6BFc7ED1C1Aa8c7954EB0ECd1E00e71b8',
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const factory = config[chain]
  module.exports[chain] = {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory, })
  }
})

module.exports.ethereum.staking = staking(["0x3e902c462103D45C073826bD9d134799fb427669", '0x587FBF916f9e4F046F8525c55B0E59Bb10ddC8ba'], "0x0258F474786DdFd37ABCE6df6BBb1Dd5dfC4434a")
module.exports.bsc.staking = staking(["0xd2C8b8915C8D8548Bf4F16a8CdCe73dE7796c39E", '0x3dc27D9973DFB583989B1C876e9723C32C2F9429'], "0xe4ca1f75eca6214393fce1c1b316c237664eaa8e")