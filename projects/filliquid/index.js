async function tvl(api) {
  // https://github.com/FILL-Lab/FILLiquid/blob/main/contracts/FILLiquid.sol
  const res = await api.call({ abi: abi.getStatus, target: '0xFD669BDDfbb0d085135cBd92521785C39c95bA4b'})
  api.addGasToken(res.totalFIL)
}
const abi = {
  getStatus: "function getStatus() view returns ((uint256 totalFIL, uint256 availableFIL, uint256 utilizedLiquidity, uint256 accumulatedDeposit, uint256 accumulatedRedeem, uint256 accumulatedBurntFILTrust, uint256 accumulatedMintFILTrust, uint256 accumulatedBorrow, uint256 accumulatedPayback, uint256 accumulatedInterest, uint256 accumulatedRedeemFee, uint256 accumulatedBorrowFee, uint256 accumulatedBadDebt, uint256 accumulatedLiquidateReward, uint256 accumulatedLiquidateFee, uint256 accumulatedDeposits, uint256 accumulatedBorrows, uint256 utilizationRate, uint256 exchangeRate, uint256 interestRate, uint256 collateralizedMiner, uint256 minerWithBorrows, uint256 rateBase))"
}

module.exports = {
  filecoin: { tvl }
}
