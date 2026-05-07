// Just addresses by chains. No ABI/logic here.
    // Format:
    // {
    //   erc4626:        [vaultAddr, ...],
    //   issuanceTokens: [tokenAddr, ...],
    //   predeposit:     [tokenAddr, ...],
    //   boring:         [vaultAddr, ...],
    // }
    
const CONFIG = {
  ethereum: {
    erc4626: [
      '0x8ecc0b419dfe3ae197bc96f2a03636b5e1be91db', // Kelp sbUSD Vault
      '0x472425cc95be779126afa4aa17980210d299914f', // UltraYield BTC
      '0x546329a16dcedc46e93f7b03a65f49a84700bca1', // UltraYield USD
      '0xaa3cb36be406e6cf208d218fd214e0f1a71e957d', // LoopedBTC
      '0xfacaa225fcfcd8644a77f2cce833907537198ae9', // Resolv USR Ecosystem Vault
    ],
  },
};

module.exports = { CONFIG };