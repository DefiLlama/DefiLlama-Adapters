const { getLogs } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const FACTORY = "0xbf656702ad1bdf92082f957937175278ff48e5d9";
const ZNZF = "0x65ee0ce656908544a1f29856ac9aee8563b5002c";
// Canonical $ZNZF curve, deployed outside the factory
const ZNZF_CURVE = "0xda1650faaec372925c9211e6625ba5d9a4397d57";

const LAUNCHED =
  "event TokenLaunched(address indexed token, address indexed curve, address indexed creator, address quote, string symbol)";

// launches quoted in $ZNZF, the protocol's own token, are reported as staking
const sumCurves = (isZnzf) => async (api) => {
  const logs = await getLogs({ api, target: FACTORY, eventAbi: LAUNCHED, fromBlock: 70344713, onlyArgs: true });
  const tokensAndOwners = isZnzf ? [] : [[ADDRESSES.null, ZNZF_CURVE]];
  for (const { quote, curve } of logs)
    if ((quote.toLowerCase() === ZNZF) === isZnzf) tokensAndOwners.push([quote, curve]);
  // the factory accepts any quote address, so a non-ERC20 quote must not break the sum
  return sumTokens2({ api, tokensAndOwners, permitFailure: true });
};

module.exports = {
  methodology:
    "TVL is the quote asset held by each Zenze bonding curve. The token a curve is selling is not counted. Collected fees are not counted. Curves quoted in $ZNZF, the protocol's own token, are counted as staking.",
  robinhood: {
    tvl: sumCurves(false),
    staking: sumCurves(true),
  },
};
