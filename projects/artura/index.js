const abi = {
    totalAssets: "function totalAssets() public view returns (uint256 totalManagedAssets)"
}
const VAULT_CONTRACT = '0x795E2FCb8E2A3786F4A318b84a6e1BfFF4Cf285A';
const PUSD_CONTRACT = '0x42725b4D9270CFe24F6852401fdDa88248CB4dE9';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: abi.totalAssets,
    target: VAULT_CONTRACT,
    params: [],
  });

  api.add(PUSD_CONTRACT, collateralBalance)
}
module.exports = {
  methodology: 'counts the number of PUSD in the Artura Vault contract.',
  start: 758842,
  botanix: {
    tvl,
  }
}; 