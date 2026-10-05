const ADDRESSES = require("../helper/coreAssets.json");
const { getConfig } = require("../helper/cache");
const { sumTokens2: sumSolana } = require("../helper/solana");
const { sumTokens2 } = require("../helper/unwrapLPs");

// fomo-mcp copy (https://copy.fomomcp.app): every user gets a Solana and an EVM trading wallet.
// The app lists those addresses; balances are read on chain.
const WALLETS = "https://copy.fomomcp.app/api/tvl-wallets";
const wallets = () => getConfig("fomomcp/wallets", WALLETS);

// Cash and gas on each EVM chain the app trades on (token positions there are mostly unpriced memecoins).
const EVM_TOKENS = {
  robinhood: [ADDRESSES.null, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG],
  base: [ADDRESSES.null, ADDRESSES.base.USDC, ADDRESSES.base.WETH],
  bsc: [ADDRESSES.null, ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT, ADDRESSES.bsc.WBNB],
  ethereum: [ADDRESSES.null, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT],
};

async function solanaTvl(api) {
  const { solana } = await wallets();
  return sumSolana({ api, owners: solana, solOwners: solana });
}

const evmTvl = (chain) => async (api) => {
  const { evm } = await wallets();
  return sumTokens2({ api, owners: evm, tokens: EVM_TOKENS[chain] });
};

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the money fomo-mcp copy users hold in their own trading wallets: USDC (the app's cash), SOL and the tokens of their open copied positions on Solana, plus native gas tokens and stablecoins on the EVM chains it trades on. The wallet list comes from https://copy.fomomcp.app/api/tvl-wallets; every balance is read on chain.",
  solana: { tvl: solanaTvl },
  ...Object.fromEntries(Object.keys(EVM_TOKENS).map((chain) => [chain, { tvl: evmTvl(chain) }])),
};
