const { getProvider, sumTokens2 } = require('../helper/solana');
const { Program } = require("@coral-xyz/anchor");

const riftIdl = {
  "version": "0.1.0",
  "name": "rifts_protocol",
  "address": "29JgMGWZ28CSF7JLStKFp8xb4BZyf7QitG5CHcfRBYoR",
  "instructions": [],
  "accounts": [
    {
      "name": "Rift",
      "discriminator": [191, 145, 151, 37, 226, 141, 115, 173]
    }
  ],
  "types": [
    {
      "name": "Rift",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "name", "type": { "array": ["u8", 32] } },
          { "name": "creator", "type": "pubkey" },
          { "name": "underlying_mint", "type": "pubkey" },
          { "name": "rift_mint", "type": "pubkey" },
          { "name": "vault", "type": "pubkey" },
          { "name": "fees_vault", "type": "pubkey" },
          { "name": "withheld_vault", "type": "pubkey" }
        ]
      }
    }
  ],
  "events": [],
  "errors": []
};

const RIFT_CONTRACTS = {
  rRiftsWithheldVault: "CHTUZeARVKM5TDaty5aGeoQavoFpXT7EhVF5QpgY5wzG",
  rRiftsFeesVault: "2DuCENm4A7qfTnzieAucZoswzaC9feiDKH3NWGzdKzq6",
  rSolWithheldVault: "D3esk6YRRxMZRnH5fNAfqpXeLYRYUMNq5aWp8ykTcUy7",
};

const RIFT_TOKEN = "HjBMk5rABYdAvukYRvrScBnP9KnN9nLdKSbN2QPppump";

async function tvl(api) {
  const provider = getProvider();
  const program = new Program(riftIdl, provider);
  
  const tokenAccounts = [
    RIFT_CONTRACTS.rRiftsWithheldVault,
    RIFT_CONTRACTS.rRiftsFeesVault,
    RIFT_CONTRACTS.rSolWithheldVault,
  ];
  
  const rifts = await program.account.rift.all();
  rifts.forEach(({ account }) => {
    tokenAccounts.push(
      account.vault.toString(),
      account.feesVault.toString(),
      account.withheldVault.toString()
    );
  });
  
  return sumTokens2({ tokenAccounts, api, allowError: true });
}

async function staking(api) {
  const provider = getProvider();
  const program = new Program(riftIdl, provider);
  
  const tokenAccounts = [
    RIFT_CONTRACTS.rRiftsWithheldVault,
    RIFT_CONTRACTS.rRiftsFeesVault,
  ];
  
  const rifts = await program.account.rift.all();
  rifts.forEach(({ account }) => {
    tokenAccounts.push(account.withheldVault.toString());
  });
  
  await sumTokens2({ tokenAccounts, api, allowError: true });
  
  const balances = api.getBalances();
  const riftKey = `solana:${RIFT_TOKEN}`;
  const riftBalance = balances[riftKey] || 0;
  
  return {
    [riftKey]: riftBalance
  };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking,
  },
  methodology: 'TVL counts all assets locked in Rift Protocol vaults including rRIFTS withheld vault, rRIFTS fees vault, rSOL withheld vault, and all assets in individual rifts created by V2 program. Staking counts RIFT tokens locked in protocol vaults.',
};
