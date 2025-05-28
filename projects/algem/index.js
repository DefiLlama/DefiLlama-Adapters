const LIQUID_STAKING_CONTRACT = "0x70d264472327B67898c919809A9dc4759B6c0f27";

async function tvl(api) {
  const bal = await api.call({ abi: 'uint256:totalBalance', target: LIQUID_STAKING_CONTRACT })
  api.addCGToken('astar', bal / 1e18)
}

module.exports = {
  methodology: 'counts the number of ASTR tokens locked in Liquid Staking contract',
  astar: {
    tvl,
  }
}; 
