const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const TREASURY1 = '0xe5F6f7181EEc4C2A8ae59e5dE2aFeD32E9ea3250'
const TREASURY2 = '0xA41f36D9F8c9eD352Ed80105C921D55559C2F8E9'
const TREASURY3 = '0xBA07DbA88B9d3700c169cE82Ced3C1bF4791b3b6'
const TREASURY4 = '0x7A748CE254bb2E377aaFd24b81Eb4442c1a57734'
const TREASURY5 = '0x33a733B6b613A2178109F2353B6369D2d3a86b0e'
const TREASURY6 = '0x22F519e33550A0F521DF80080f8Aabe22e63131d'
const BAD = '0x32b86b99441480a7E5BD3A26c124ec2373e3F015'



module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ],
    owners: [TREASURY1, TREASURY2, TREASURY3, TREASURY4, TREASURY5, TREASURY6],
    ownTokens: [BAD],
  },
});