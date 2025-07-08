const { unwrapLPsAuto, nullAddress, sumTokensExport } = require('../helper/unwrapLPs')

const masterchef = '0x652a63c4df14e29080Ab058d6f151aBa61F86c10'

async function tvl(api) {
  const pools = await api.fetchList({ lengthAbi: 'uint256:poolLength', itemAbi: 'function registeredToken(uint256) view returns (address)', target: masterchef })
  const poolInfo = await api.multiCall({ abi: 'function getPoolInfo(address) view returns ( uint256 emission, uint256 allocpoint, uint256 sizeOfPool, uint256 totalPoint)', calls: pools, target: masterchef })
  const poolInfo2 = await api.multiCall({ abi: 'function  addressToPoolInfo(address) view returns ( address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accATHPerShare, address rewarder, address helper, address locker)', calls: pools, target: masterchef })

  const poolHelperData = []
  poolInfo2.forEach((data, index) => {
    if (pools[index].toLowerCase() === '0xfc56eac0d0e53105f7a45a669baf662c0ee292ed') return; // ignore ATH token
    if (pools[index].toLowerCase() === '0x724ccdcf3f77096963b8e0849dab3eb142b167a4') return; // ignore ATH LP token
    if (data.helper === '0xeB27E1C356b173277bb75ACA3a3f8a0164Fa0ABa') {
      api.add('0x724CcDcf3F77096963B8e0849dab3Eb142b167a4', poolInfo[index].sizeOfPool)
    } else if (data.helper === nullAddress) {
      api.add(pools[index], poolInfo[index].sizeOfPool)
    } else {
      poolHelperData.push({
        helper: data.helper,
        balance: poolInfo[index].sizeOfPool
      })
    }
  })
  const depositToken = await api.multiCall({ abi: 'address:depositToken', calls: poolHelperData.map(i => i.helper) })
  depositToken.forEach((data, index) => api.add(data, poolHelperData[index].balance))

  return unwrapLPsAuto({ api, })
}


module.exports = {
  doublecounted: true,
  metis: {
    tvl,
    staking: sumTokensExport({ owner: '0xD481eD22a20708839aeB7f1d07E1d01cbc526184', tokens: ['0xA4eE142e34d0676Edc2b760DD0016003D99a4ceC'] }),
    pool2: sumTokensExport({ owner: masterchef, tokens: ['0x724CcDcf3F77096963B8e0849dab3Eb142b167a4'], resolveLP: true, }),
  }
}