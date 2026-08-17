const { sumTokens2 } = require('../helper/unwrapLPs');

// Foundation MetaMask Master Cold Wallet
const METAMASK_MASTER_WALLET = '0x87a3A5E8383A31D6d07146b1a457dBd8d50de58D';

// WPLUSWALLET.COM System Master Vault Wallet
const WPLUS_WALLET_SYSTEM_VAULT = '0x5CfEa22674e2E7d251dEB693c0490b6389334F0f';

const USDT_ETHEREUM = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [METAMASK_MASTER_WALLET, WPLUS_WALLET_SYSTEM_VAULT],
    tokens: [USDT_ETHEREUM]
  });
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Calculates Total Value Locked (TVL) in PLUS Mainnet Foundation MetaMask Master Cold Wallet and WPLUSWALLET.COM System Vault.",
  ethereum: {
    tvl
  }
};
