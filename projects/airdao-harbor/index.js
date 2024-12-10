async function tvl(api) {
  const totalStake = await api.call({ abi: 'uint256:getTotalStAmb', target: '0xBda7cf631Db4535A500ED16Dd98099C04e66F1d5' })
  api.addGasToken(totalStake)
}

module.exports = {
  methodology: `TVL counts deposits made to Harbor liquid staking on AirDAO.`,
  airdao: {
    tvl
  }
}