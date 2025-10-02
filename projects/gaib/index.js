async function tvl(timestamp, ethBlock, chainBlocks) {
  // Mock data for GAIB protocol
  const mockStakingPools = [
    { id: 'pool1', totalStakedUSD: '1500000', chain: 'arbitrum' },
    { id: 'pool2', totalStakedUSD: '2300000', chain: 'arbitrum' },
    { id: 'pool3', totalStakedUSD: '800000', chain: 'arbitrum' }
  ];
  
  const mockVolumes = [
    { id: 'vol1', volumeUSD: '45000', timestamp: timestamp.toString() },
    { id: 'vol2', volumeUSD: '32000', timestamp: (timestamp - 3600).toString() },
    { id: 'vol3', volumeUSD: '28000', timestamp: (timestamp - 7200).toString() },
    { id: 'vol4', volumeUSD: '51000', timestamp: (timestamp - 10800).toString() }
  ];
  
  const totalTvl = mockStakingPools
    .filter(pool => pool.chain === 'arbitrum')
    .reduce((acc, pool) => acc + parseFloat(pool.totalStakedUSD), 0);
  
  const oneDayAgo = timestamp - 86400;
  const dailyVolume = mockVolumes
    .filter(vol => parseInt(vol.timestamp) >= oneDayAgo)
    .reduce((acc, vol) => acc + parseFloat(vol.volumeUSD), 0);
  
  return { tvl: totalTvl, staking: totalTvl, '24hVolume': dailyVolume };
}

module.exports = {
  methodology: 'Mock TVL from AID/robotics staking on Arbitrum. Volumes from swaps.',
  arbitrum: { tvl }
};