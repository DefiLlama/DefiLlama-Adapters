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
      '0x472425cc95be779126afa4aa17980210d299914f', // UltraYield BTC
      '0x8ecc0b419dfe3ae197bc96f2a03636b5e1be91db', // Kelp sbUSD Vault
    ],
  },
};

module.exports = { CONFIG };