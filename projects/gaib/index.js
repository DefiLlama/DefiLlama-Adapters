const { request, gql } = require('graphql-request');

const GAIB_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/gaib/gaib-arbitrum'; // Test endpoint

async function tvl(timestamp, ethBlock, chainBlocks) {
  const query = gql`
    {
      stakingPools {
        id
        totalStakedUSD
        chain
      }
      volumes(first: 1000) {
        id
        volumeUSD
        timestamp
      }
    }
  `;
  
  const response = await request(GAIB_SUBGRAPH, query);
  
  const totalTvl = response.stakingPools
    .filter(pool => pool.chain === 'arbitrum')
    .reduce((acc, pool) => acc + parseFloat(pool.totalStakedUSD), 0);
  
  const oneDayAgo = timestamp - 86400;
  const dailyVolume = response.volumes
    .filter(vol => parseInt(vol.timestamp) >= oneDayAgo)
    .reduce((acc, vol) => acc + parseFloat(vol.volumeUSD), 0);
  
  return { tvl: totalTvl, staking: totalTvl, '24hVolume': dailyVolume };
}

module.exports = {
  methodology: 'Test TVL from AID/robotics staking on Arbitrum via subgraph (POC). Volumes from swaps.',
  arbitrum: { tvl }
};