const { getLogs } = require("../helper/cache/getLogs");

// Current production Manager and deployment block on X Layer.
// Explorer: https://www.okx.com/web3/explorer/xlayer/address/0x96b51c57e5346d0c0198899243cf851d1e23c309
const MANAGER = "0x96b51c57e5346d0c0198899243cf851d1e23c309";
const FROM_BLOCK = 68_373_506;
const ZERO = "0x0000000000000000000000000000000000000000";
const ZERO_POOL = `0x${"0".repeat(64)}`;

const TOKEN_CREATED =
  "event TokenCreated(address indexed token,address indexed creator,address indexed quote,uint256 graduation,string metadataURI,address vault,address tracker,uint16 templateId)";
const TOKEN_STATE =
  "function tokens(address) view returns (address creator,uint16 buyFeeBps,uint16 sellFeeBps,uint16 taxBuyBps,uint16 taxSellBps,address quote,uint16 snipeStartBps,uint16 snipeMins,uint64 createdAt,uint128 vQuote,uint128 vToken,uint128 sold,uint128 collected,uint128 sellable,uint128 reserve,bytes32 poolId)";

async function tvl(api) {
  const launches = await getLogs({
    api,
    target: MANAGER,
    eventAbi: TOKEN_CREATED,
    fromBlock: FROM_BLOCK,
    onlyArgs: true,
  });
  const tokens = [...new Set(launches.map((log) => log.token.toLowerCase()))];
  if (!tokens.length) return;
  const calls = tokens.map((token) => ({ target: MANAGER, params: [token] }));
  const [states, pairs] = await Promise.all([
    api.multiCall({ abi: TOKEN_STATE, calls }),
    api.multiCall({ abi: "function pairOf(address) view returns (address)", calls }),
  ]);

  for (let i = 0; i < tokens.length; i++) {
    const state = states[i];
    if (state.poolId !== ZERO_POOL || pairs[i] !== ZERO) continue;
    if (state.quote === ZERO) api.addGasToken(state.collected);
    else api.add(state.quote, state.collected);
  }
}

module.exports = {
  methodology:
    "Counts quote principal held in live Ignix bonding curves. V2- and V4-graduated liquidity is excluded to avoid double-counting Uniswap TVL.",
  xlayer: { tvl },
};
