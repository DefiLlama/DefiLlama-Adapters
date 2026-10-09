const { nullAddress, treasuryExports } = require('../helper/treasury')

// Packed (packd.cc) keeps its fee income in one wallet, the same address on both chains. Every
// Packed factory pays its launch fee and protocol share there: protocolFeeRecipient() on the
// Robinhood Chain factories, and the fee recipient of the Ethereum factories.
// https://robinhoodchain.blockscout.com/address/0x71BB2cc5Be1599AaCD36080321f1b781a46fD1d9
// https://etherscan.io/address/0x71BB2cc5Be1599AaCD36080321f1b781a46fD1d9
const FEE_WALLET = '0x71BB2cc5Be1599AaCD36080321f1b781a46fD1d9'

// $PACKD, Packed's own token on Robinhood Chain. The fee wallet buys it back and burns it, so it
// is reported as own tokens, never as treasury.
// https://robinhoodchain.blockscout.com/token/0x853E1A36876Cc4538BE636B78E7b2BD0aABC0dEd
const PACKD = '0x853E1A36876Cc4538BE636B78E7b2BD0aABC0dEd'

module.exports = treasuryExports({
  robinhood: {
    owners: [FEE_WALLET],
    tokens: [nullAddress],
    ownTokens: [PACKD],
  },
  // Only ETH is read on Ethereum: the wallet's other tokens there are the launched coins' side of
  // pool fees, which have no price, and token discovery on this chain needs a paid API key.
  ethereum: {
    owners: [FEE_WALLET],
    tokens: [nullAddress],
    fetchCoValentTokens: false,
  },
})
