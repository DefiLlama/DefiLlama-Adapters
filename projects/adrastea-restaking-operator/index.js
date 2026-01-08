const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require("@solana/web3.js");
const { getConnection, decodeAccount } = require("../helper/solana");

const VAULT_PROGRAM_ID = new PublicKey("Vau1t6sLNxnzB7ZDsef8TLbPLfyZMYXH8WTNqUdm9g8");
const ADRASTEA_OPERATOR_ADDRESS = "574DmorRvpaYrSrBRUwAjG7bBmrZYiTW3Fc8mvQatFqo";

async function tvl(api) {
  const connection = getConnection();

  const vaults = [
    {
      address: 'BmJvUzoiiNBRx3v2Gqsix9WvVtw8FaztrfBHQyqpMbTd',
      token: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
      name: 'JTO'
    },
    {
      address: 'HR1ANmDHjaEhknvsTaK48M5xZtbBiwNdXM5NTiWhAb4S',
      token: 'nSoLnkrvh2aY792pgCNT6hzx84vYtkviRzxvhf3ws8e',
      name: 'nSOL'
    }
  ];

  for (const vault of vaults) {
    // Get Adrastea's delegation account for this vault
    const delegationAccounts = await connection.getProgramAccounts(
      VAULT_PROGRAM_ID,
      {
        filters: [
          { dataSize: 632 },
          { memcmp: { offset: 8, bytes: vault.address } },
          { memcmp: { offset: 40, bytes: ADRASTEA_OPERATOR_ADDRESS } },
        ]
      }
    );

    if (delegationAccounts.length > 0) {
      // Decode the delegation account using proper layout
      const delegationData = decodeAccount('jitoVaultOperatorDelegation', delegationAccounts[0].account);
      const stakedAmount = delegationData.delegationState.stakedAmount.toString();

      if (BigInt(stakedAmount) > 0) {
        if (vault.name === 'nSOL') {
          // Convert nSOL to SOL for price feed
          api.add(ADDRESSES.solana.SOL, stakedAmount);
        } else {
          api.add(vault.token, stakedAmount);
        }
      }
    }
  }
}

module.exports = {
  methodology: "Tracks Adrastea operator's proportional share of delegated assets in Jito Restaking vaults based on VaultOperatorDelegation accounts",
  start: 1738281600, // Jan 31, 2025 - when Adrastea joined according to Jito interface
  timetravel: false,
  solana: {
    tvl,
  },
};