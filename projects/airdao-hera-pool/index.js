async function tvl(api) {
  const totalStake = await api.call({abi: 'uint256:totalStake', target: '0x0E051C8C1cd519d918DB9b631Af303aeC85266BF'})
  api.addCGToken('amber', totalStake/1e18)
}

module.exports = {
  methodology: `TVL counts deposits made to Hera pool on AirDAO.`,
  airdao: {
    tvl
  }
}
