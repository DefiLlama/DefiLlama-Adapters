
const { PublicKey } = require("@solana/web3.js");
const { parseLido, parseLidoValidatorList } = require('./layouts/lido')
const { parsePhoenix } = require('./layouts/phoenix-dex')
const { RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM, RAYDIUM_STABLE_STATE_LAYOUT_V1, } = require('./layouts/raydium-layout')
const { INVESTIN_FUND_DATA, } = require('./layouts/investin-layout')
const { MARKET_STATE_LAYOUT_V3, } = require('./layouts/openbook-layout')
const { ReserveLayout, ReserveLayoutLarix, MintLayout, AccountLayout, TokenSwapLayout, } = require('./layouts/mixed-layout')

// console.log(RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM.span, 'RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM')

const parseReserve = (info) => {
  const pubkey = PublicKey.default
  const { data } = info;
  const buffer = Buffer.from(data);
  const reserve = ReserveLayout.decode(buffer);

  if (reserve.lastUpdate.slot.isZero()) {
    return null;
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: reserve,
  };

  return details;
}

const defaultParseLayout = Layout => info => {
  const { data } = info;
  const buffer = Buffer.from(data);
  return Layout.decode(buffer);
}

const customDecoders = {
  reserve: parseReserve,
  lido: parseLido,
  lidoValidatorList: parseLidoValidatorList,
  mint: defaultParseLayout(MintLayout),
  account: defaultParseLayout(AccountLayout),
  tokenSwap: defaultParseLayout(TokenSwapLayout),
  larixReserve: defaultParseLayout(ReserveLayoutLarix),
  investinFund: defaultParseLayout(INVESTIN_FUND_DATA),
  openbook: defaultParseLayout(MARKET_STATE_LAYOUT_V3),
  // raydiumLPv4: defaultParseLayout(RAYDIUM_LIQUIDITY_STATE_LAYOUT_V4),
  raydiumCLMM: defaultParseLayout(RAYDIUM_LIQUIDITY_STATE_LAYOUT_CLMM),
  raydiumLPStable: defaultParseLayout(RAYDIUM_STABLE_STATE_LAYOUT_V1),
  fluxbeam: defaultParseLayout(TokenSwapLayout),
  phoenix: parsePhoenix,
}

function decodeAccount(layout, accountInfo) {
  if (!accountInfo.data) throw new Error('Missing account data')
  if (customDecoders[layout]) return customDecoders[layout](accountInfo)
  throw new Error('Layout not found: ' + layout)
}

module.exports = {
  decodeAccount,
}