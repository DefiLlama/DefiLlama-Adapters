async function tvl(api) {
  // https://github.com/FILL-Lab/FILLiquid/blob/main/contracts/FILLiquid.sol
  const res = await api.call({ abi: 'uint256:getTVL', target: '0xA25F892cF2731ba89b88750423Fc618De0959C43'})
  api.addGasToken(res)
}

module.exports = {
  methodology: 'Get the total amount of pledge and account balance of fil in the statistical contract',
  filecoin: { tvl }
}
