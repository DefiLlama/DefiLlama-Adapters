const { masterchefExports } = require('../helper/unknownTokens')
const abi = require('./abi')

const params = {
  masterchef: '0x0D2C835C56BE5830FAd8082732B43efe30C958f3',
  nativeToken: '0x37CDC46C78Cf403F1Da8a1eeBCffB3ed1DD01868', 
  getBalance: output => output.amount,
  poolInfoABI: abi.poolInfo,
  useDefaultCoreAssets: true,
}

const bscExports = masterchefExports({
  chain: 'bsc',
  ...params,
})

const klaytnExports = masterchefExports({
  chain: 'klaytn',
  ...params,
})


module.exports = {
  ...bscExports,
  ...klaytnExports,
}