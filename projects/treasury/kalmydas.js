const { treasuryExports } = require('../helper/treasury')
const ADDRESSES = require('../helper/coreAssets.json')

// Kal Mydas protocol treasury on Base mainnet.
// - Gnosis Safe multisig (protocol treasury: USDC, KAL)
// - TreasuryRWAV2 (tokenized gold and bitcoin reserve, being funded)
// - RainyDayFund (emergency reserve)
const KAL = '0xe99556D5594faf533fcB346A8a9B11259D29afA8'

module.exports = treasuryExports({
    base: {
          owners: [
                  '0x55a7645F04CEbCE3eb706D441cB649fFDe4D5027', // Gnosis Safe multisig
                  '0x4f1F316e76d8E8637006eF246E9dD6dc3b4680C1', // TreasuryRWAV2
                  '0xD1795dD0Cfe169E4dE601469C07E0c4884aD251f', // RainyDayFund
                ],
          tokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH],
          ownTokens: [KAL],
    },
})
