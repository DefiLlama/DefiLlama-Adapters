const vaultAbi = {
    "vaultDebtVal": "uint256:vaultDebtVal",
    "pendingInterest": "function pendingInterest(uint256 value) view returns (uint256)",
}

module.exports = {
    vaultAbi,
}