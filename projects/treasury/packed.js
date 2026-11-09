const { nullAddress, treasuryExports } = require('../helper/treasury')

// Packed (packd.cc) keeps its fee income in a fee wallet, the same address on both chains. Every
// Robinhood Chain factory and the older Ethereum factories pay their launch fee and protocol share
// there (protocolFeeRecipient()).
// https://robinhoodchain.blockscout.com/address/0x71BB2cc5Be1599AaCD36080321f1b781a46fD1d9
// https://etherscan.io/address/0x71BB2cc5Be1599AaCD36080321f1b781a46fD1d9
const FEE_WALLET = '0x71BB2cc5Be1599AaCD36080321f1b781a46fD1d9'

// The newest Ethereum factory (0xA5fB8E98aedb2ab59a61971a6956399dF8059511) pays them to a 2-of-3
// Safe instead; its protocolFeeRecipient() answers this address. Ethereum only.
// https://etherscan.io/address/0xbCa2BE8461f1681C73b44E499611c2F6fA9fAF29
const FEE_SAFE_ETHEREUM = '0xbCa2BE8461f1681C73b44E499611c2F6fA9fAF29'

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
  // Only ETH is read on Ethereum: the wallets' other tokens there are the launched coins' side of
  // pool fees, which have no price, and token discovery on this chain needs a paid API key. The
  // two owners are different addresses, so no balance is read twice.
  ethereum: {
    owners: [FEE_WALLET, FEE_SAFE_ETHEREUM],
    tokens: [nullAddress],
    fetchCoValentTokens: false,
  },
})
