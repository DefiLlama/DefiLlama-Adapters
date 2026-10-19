const { getLogs2 } = require("../helper/cache/getLogs");

const MANAGER = "0x96b51c57e5346d0c0198899243cf851d1e23c309";
const FROM_BLOCK = 68_373_506;

const TOKEN_CREATED = "event TokenCreated(address indexed token,address indexed creator,address indexed quote,uint256 graduation,string metadataURI,address vault,address tracker,uint16 templateId)";

async function tvl(api) {
  const launches = await getLogs2({
    api,
    target: MANAGER,
    eventAbi: TOKEN_CREATED,
    fromBlock: FROM_BLOCK,
  });

  const quotes = [...new Set(launches.map((l) => l.quote.toLowerCase()))];
  await api.sumTokens({ ownerTokens: [[quotes, MANAGER]] });

  // exclude platform fees held by the Manager
  const fees = await api.multiCall({
    abi: "function platformAccrued(address) view returns (uint256)",
    calls: quotes.map((q) => ({ target: MANAGER, params: [q] })),
  });
  quotes.forEach((q, i) => api.add(q, (-BigInt(fees[i])).toString()));
}

module.exports = {
  methodology: "Counts the quote principal held by the Ignix Manager across all live bonding curves. When a token graduates, its quote migrates into the Uniswap V2/V4 pool and leaves the Manager, so graduated liquidity is naturally excluded.",
  xlayer: { tvl },
};
