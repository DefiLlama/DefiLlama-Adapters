const VAULT_MANAGER_ADDRESS = "0xaFE480f375EBd13dF703ef50b429357d29D162Ee";

async function tvl(api) {
  const vaultInfos = [];
  let index = 1;
  
  while (true) {
    try {
      const vault = await api.call({
        target: VAULT_MANAGER_ADDRESS,
        abi: 'function vaults(uint256) view returns (tuple(address shareToken, address assetToken, address vaultAddress, string name, uint256 depositOpenAt, uint256 depositCloseAt, uint256 withdrawOpenAt))',
        params: [index]
      });
      if (vault.vaultAddress === '0x0000000000000000000000000000000000000000') break;
      vaultInfos.push(vault);
      index++;
    } catch {
      break;
    }
  }
  
  if (vaultInfos.length === 0) return;
  
  const now = api.timestamp;
  
  const preWithdrawalVaults = [];
  const withdrawalVaults = [];
  
  vaultInfos.forEach(vault => {
    if (now < vault.withdrawOpenAt) {
      preWithdrawalVaults.push(vault);
    } else {
      withdrawalVaults.push(vault);
    }
  });
  
  if (preWithdrawalVaults.length > 0) {
    const supplies = await api.multiCall({
      abi: 'erc20:totalSupply',
      calls: preWithdrawalVaults.map(v => v.shareToken)
    });
    preWithdrawalVaults.forEach((vault, i) => {
      api.add(vault.assetToken, supplies[i]);
    });
  }
  
  if (withdrawalVaults.length > 0) {
    const balances = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: withdrawalVaults.map(v => ({
        target: v.assetToken,
        params: [v.vaultAddress]
      }))
    });
    withdrawalVaults.forEach((vault, i) => {
      api.add(vault.assetToken, balances[i]);
    });
  }
}

module.exports = {
  arbitrum: {
    tvl,
  },
};
