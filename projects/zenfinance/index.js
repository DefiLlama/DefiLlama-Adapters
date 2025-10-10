const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: "Counts all supported tokens held by ZenStake, ZenRecharge, and ZenSwap contracts including CRO, ARY, stablecoins, and meme tokens.",
  cronos: {
    tvl: sumTokensExport({ 
      owners: [
        "0x620B2367E630430C615ccF5CA02084c11995Fe25",
        "0xD39e62C0FFb6653BDE0f8f456E9624BF64216126",
        "0xEB401e50e30E770222bDeA6CA6938B237De1f3f9"
      ],
      tokens: [
        "0x0000000000000000000000000000000000000000",
        "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
        "0x41bc026dABe978bc2FAfeA1850456511ca4B01bc",
        "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
        "0x66e428c3f67a68878562e79A0234c1F83c208770",
        "0xaF02D78F39C0002D14b95A3bE272DA02379AfF21",
        "0xe731AE82887Ae35942C124dC6bC168995C9F2aB4",
        "0x055c517654d72A45B0d64Dc8733f8A38E27Fd49C",
        "0xcCcCcCcCdbEC186DC426F8B5628AF94737dF0E60",
        "0xcfe223d06b86568c24ffd17e8ac748dbac096b3b",
        "0xBCfE5afF53fb269969725c12e5b9C3ab18B3B66c",
        "0x898cD4E6F0a364956e28CB0B51f67a4A0f02589c",
        "0x6b431B8a964BFcf28191b07c91189fF4403957D0",
        "0x7492450cc8897a4e444Ad972eB1619251EF15C23",
        "0x4d7c922D6C12CfbF5BC85F56c9ccB1F61f49bf61",
        "0x3b41B27E74Dd366CE27cB389dc7877D4e1516d4d",
        "0x288898a6057d2D4989c533E96Cb3bc30843c91D7",
        "0x8C9E2bEf2962CE302ef578113eebEc62920B7e57",
        "0x46e2b5423f6ff46a8a35861ec9daff26af77ab9a"
      ]
    })
  }
};
