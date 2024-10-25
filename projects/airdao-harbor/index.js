async function tvl(api) {
  const totalStake = await api.call({ abi: 'uint256:getTotalStAmb', target: '0xBda7cf631Db4535A500ED16Dd98099C04e66F1d5' })
  api.addCGToken('amber', totalStake/1e18)
}

module.exports = {
  methodology: `TVL counts deposits made to Harbor on AirDAO.`,
  airdao: {
    tvl
  }
}
