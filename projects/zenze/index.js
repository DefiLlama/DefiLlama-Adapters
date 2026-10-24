const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const ZERO = ADDRESSES.null;

// Quote assets locked in bonding curves. The launch token sitting in its own
// curve is inventory, not TVL. Fees already forwarded to the vault are not TVL.
const CHAINS = {
  robinhood: {
    factory: "0xbf656702ad1bdf92082f957937175278ff48e5d9",
    fromBlock: 70344713,
    // Canonical $ZNZF curve. It was not created by the factory.
    nativeCurves: ["0xda1650faaec372925c9211e6625ba5d9a4397d57"],
  },
};

const LAUNCHED =
  "event TokenLaunched(address indexed token, address indexed curve, address indexed creator, address quote, string symbol)";

async function tvl(api) {
  const cfg = CHAINS[api.chain];
  const logs = await getLogs({
    api,
    target: cfg.factory,
    eventAbi: LAUNCHED,
    fromBlock: cfg.fromBlock,
    onlyArgs: true,
  });

  const tokensAndOwners = [];
  const seen = new Set();

  const addNative = (curve) => {
    const key = `native:${curve.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    tokensAndOwners.push([ZERO, curve]);
  };

  for (const curve of cfg.nativeCurves) addNative(curve);

  for (const log of logs) {
    const quote = String(log.quote).toLowerCase();
    const token = String(log.token).toLowerCase();
    if (quote === ZERO || quote === "0x0000000000000000000000000000000000000000") {
      addNative(log.curve);
      continue;
    }
    // Never count the curve's own launch token.
    if (quote === token) continue;
    const key = `${quote}:${log.curve.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    tokensAndOwners.push([log.quote, log.curve]);
  }

  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  methodology:
    "TVL is the quote asset held by each Zenze bonding curve. The token a curve is selling is not counted. Collected fees are not counted.",
  robinhood: { tvl },
};
