const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { getProvider, sumTokens2, } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const idl = {
  "version": "0.1.0",
  "name": "depositor",
  "instructions": [],
  "accounts": [
    {
      "name": "VaultData",
      "docs": [
        "Vault is a instance that holds general deposit data for a particular token",
        "It is also responsible for freezing and migrating funds",
        "When program receives funds, they are send on vault data's account's ATA"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "owner", "type": "publicKey" },
          { "name": "mint", "type": "publicKey" },
          { "name": "vaultAta", "type": "publicKey" },
          { "name": "withdrawDuration", "type": "u64" },
          { "name": "isFrozen", "type": "bool" },
          { "name": "totalDeposited", "type": "u64" },
          { "name": "bump", "type": "u8" },
          { "name": "allowedForPurchase", "type": "bool" },
          { "name": "purchaseRecepientAta", "type": "publicKey" },
          { "name": "admin", "type": "publicKey" }
        ]
      }
    }
  ],
  "types": [],
  "events": [],
  "errors": []
}

const BRIDGE_DEPOSITOR_EVM = '0xaEA5Bf79F1E3F2069a99A99928927988EC642e0B';
const BRIDGE_DEPOSITOR_SOL = 'HYDqq5GfUj4aBuPpSCs4fkmeS7jZHRhrrQ3q72KsJdD4';

async function sol_tvl() {
  const provider = getProvider()
  const program = new Program(idl, BRIDGE_DEPOSITOR_SOL, provider)
  const tokenAccounts  = (await program.account.vaultData.all()).map((a) => a.account.vaultAta);
  return sumTokens2({ tokenAccounts })
}


module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // ETH
        ADDRESSES.ethereum.WBTC, // WBTC
        ADDRESSES.ethereum.WETH, // WETH
        ADDRESSES.ethereum.WSOL, // WSOL
        ADDRESSES.ethereum.WSTETH, // Lido WSTETH
        ADDRESSES.ethereum.EETH, // EETH
        '0xd9a442856c234a39a81a089c06451ebaa4306a72', // pufETH
        '0xf951e335afb289353dc249e82926178eac7ded78', // swETH
        ADDRESSES.ethereum.USDT, // USDT
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.DAI, // DAI
        '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110', // ezETH
        ADDRESSES.ethereum.USDe, // Ethena USD
      ],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // BNB
        ADDRESSES.bsc.USDC, // USDC
        ADDRESSES.bsc.USDT, // USDT
        '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3', // DAI
      ],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // ETH
        ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
        ADDRESSES.arbitrum.USDT, // USDT
        ADDRESSES.arbitrum.DAI, // DAI
        ADDRESSES.optimism.ezETH, // ezETH
      ],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // ETH
        ADDRESSES.base.USDC, // USDC
      ],
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // POL
        ADDRESSES.polygon.USDC, // USDC
        ADDRESSES.polygon.USDT, // USDT
        ADDRESSES.polygon.DAI, // DAI
      ],
    }),
  },
  avax: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // AVA
        ADDRESSES.avax.USDC, // USDC
        ADDRESSES.avax.USDt, // USDT
        ADDRESSES.avax.DAI, // DAI
      ],
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // ETH
        ADDRESSES.optimism.USDC_CIRCLE, // USDC
        ADDRESSES.optimism.USDT, // USDT
        ADDRESSES.optimism.DAI, // DAI
      ],
    }),
  },
  blast: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // ETH
        ADDRESSES.blast.USDB, // USDB
      ],
    }),
  },
  manta: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // ETH
        ADDRESSES.manta.WETH, // WETH
        ADDRESSES.manta.USDC, // USDC
        ADDRESSES.manta.USDT, // USDT
        "0x1468177dbcb2a772f3d182d2f1358d442b553089", // Manta mBTC
        "0xaccbc418a994a27a75644d8d591afc22faba594e", // Manta mETH
        "0x649d4524897ce85a864dc2a2d5a11adb3044f44a", // Manta mUSD
      ],
    })
  },
  bsquared: {
    tvl: sumTokensExport({
      owner: BRIDGE_DEPOSITOR_EVM,
      tokens: [
        ADDRESSES.null, // BTC
        ADDRESSES.bsquared.WBTC, // WBTC
        ADDRESSES.bsquared.USDT, // USDT
      ],
    })
  },
  solana: {
    tvl: sol_tvl
  }
}