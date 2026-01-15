const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

// ZenFinance - Multi-Asset DeFi Protocol on Cronos
// Comprehensive adapter tracking all supported tokens across three main contracts

module.exports = {
  methodology: "TVL counts external tokens held in contracts.",
  cronos: {
    tvl: sumTokensExport({ 
      owners: [
        "0x620B2367E630430C615ccF5CA02084c11995Fe25", // ZenStake v2.0 
        "0xD39e62C0FFb6653BDE0f8f456E9624BF64216126", // ZenRecharge v4.0
        "0xEB401e50e30E770222bDeA6CA6938B237De1f3f9"  // ZenSwap v3.0 
      ],
      tokens: [
        // Native & Wrapped
        ADDRESSES.null, // CRO (native)
        ADDRESSES.cronos.WCRO_1, // WCRO
        
        // Stablecoins
        ADDRESSES.cronos.USDC, // USDC
        ADDRESSES.cronos.USDT, // USDT
        
        // Ecosystem Tokens
        "0xaF02D78F39C0002D14b95A3bE272DA02379AfF21", // FRTN
        "0xe731AE82887Ae35942C124dC6bC168995C9F2aB4", // INT
        "0x46e2b5423f6ff46a8a35861ec9daff26af77ab9a",  // MOON
        
        // Meme Tokens
        "0x055c517654d72A45B0d64Dc8733f8A38E27Fd49C", // RYOSHI
        "0xcCcCcCcCdbEC186DC426F8B5628AF94737dF0E60", // CAW
        "0xcfe223d06b86568c24ffd17e8ac748dbac096b3b", // NEURO
        "0xBCfE5afF53fb269969725c12e5b9C3ab18B3B66c", // BOBZ
        "0x898cD4E6F0a364956e28CB0B51f67a4A0f02589c", // BONE
        "0x6b431B8a964BFcf28191b07c91189fF4403957D0", // CORGIAI
        "0x7492450cc8897a4e444Ad972eB1619251EF15C23", // GM
        "0x4d7c922D6C12CfbF5BC85F56c9ccB1F61f49bf61", // KITTY
        "0x3b41B27E74Dd366CE27cB389dc7877D4e1516d4d", // MERY
        "0x288898a6057d2D4989c533E96Cb3bc30843c91D7", // PUUSH
        "0x8C9E2bEf2962CE302ef578113eebEc62920B7e57"  // TURTLE
      ]
    }),
    staking: sumTokensExport({
      owners: [
        "0x620B2367E630430C615ccF5CA02084c11995Fe25", // ZenStake v2.0
        "0xD39e62C0FFb6653BDE0f8f456E9624BF64216126", // ZenRecharge v4.0
        "0xEB401e50e30E770222bDeA6CA6938B237De1f3f9"  // ZenSwap v3.0
      ],
      tokens: [
        "0x41bc026dABe978bc2FAfeA1850456511ca4B01bc"  // ARY 
      ]
    })
  }
};
