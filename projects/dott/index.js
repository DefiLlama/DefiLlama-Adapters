const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const FACTORY = "0x4B4a24aBbb7b92AFeb12D0Bca3C054fe1E7069E1";
const START_BLOCK = 5025894;
const LAUNCHED_ABI = "event Launched(address indexed token, address indexed curve, address indexed creator, string name, string symbol, string metadata, uint256 firstBuyWei)";

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: START_BLOCK,
    eventAbi: LAUNCHED_ABI,
  });
  const owners = logs.map((l) => l.curve);
  return api.sumTokens({
    owners,
    tokens: [ADDRESSES.null],
  });
}

module.exports = {
  methodology: "Counts the ETH held in DOTT (DumpFactory) bonding curves on Robinhood Chain that have not yet graduated. Curve addresses come from the factory's Launched events and their native ETH balances are summed. Graduated tokens migrate liquidity to a Uniswap V3 pool (counted by Uniswap), so only pre-graduation curve reserves are counted here to avoid double-counting.",
  robinhood: { tvl },
};
