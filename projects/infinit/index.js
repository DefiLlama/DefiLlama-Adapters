const { getLogs } = require('../helper/cache/getLogs');

const VAULT_MANAGER_ADDRESS = "0xafe480f375ebd13df703ef50b429357d29d162ee";
const START_BLOCK = 472227568;

const DEPOSITED_EVENT_ABI = "event Deposited(address indexed user, uint256 indexed index, uint256 amount)";

async function tvl(api) {
  const depositEvents = await getLogs({
    api,
    target: VAULT_MANAGER_ADDRESS,
    eventAbi: DEPOSITED_EVENT_ABI,
    fromBlock: START_BLOCK,
    onlyArgs: true,
  });

  const depositsByVault = new Map();
  
  for (const event of depositEvents) {
    const vaultIndex = Number(event.index);
    const amount = BigInt(event.amount);
    const current = depositsByVault.get(vaultIndex) || 0n;
    depositsByVault.set(vaultIndex, current + amount);
  }

  const vaultIndices = Array.from(depositsByVault.keys());

  if (vaultIndices.length === 0) {
    return;
  }

  const vaultInfos = await api.multiCall({
    abi: 'function vaults(uint256) view returns (tuple(address shareToken, address assetToken, address vaultAddress, string name, uint256 depositOpenAt, uint256 depositCloseAt, uint256 withdrawOpenAt))',
    calls: vaultIndices,
    target: VAULT_MANAGER_ADDRESS,
  });

  vaultIndices.forEach((vaultIndex, idx) => {
    const vaultInfo = vaultInfos[idx];
    const assetToken = vaultInfo.assetToken;
    const depositedAmount = depositsByVault.get(vaultIndex);
    
    api.add(assetToken, depositedAmount.toString());
  });
}

module.exports = {
  arbitrum: {
    tvl,
  },
};
