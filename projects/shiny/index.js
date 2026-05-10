const { getLogs } = require("../helper/cache/getLogs");

const TREASURY = "0x8210c4a20dfA79F555560F77dc72BD7A846a3eF1";
const PAWNSHOP = "0x8B15f05b7db42d65E19fA991EB0dE107C6ef287a";

const USDC = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  abstract: "0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1",
};

const FROM_BLOCK = { base: 40800000, abstract: 5000000 };

async function tvl(api) {
  const usdc = USDC[api.chain];

  const treasuryBal = await api.call({
    abi: "erc20:balanceOf",
    target: usdc,
    params: [TREASURY],
  });
  api.add(usdc, treasuryBal);

  const pawnedLogs = await getLogs({
    api,
    target: PAWNSHOP,
    eventAbi:
      "event TokenPawned(uint256 indexed tokenId, address indexed borrower, uint256 amount, uint256 deadline, uint16 feeBasisPoints)",
    onlyArgs: true,
    fromBlock: FROM_BLOCK[api.chain],
  });

  const tokenIds = [...new Set(pawnedLogs.map((l) => l.tokenId.toString()))];
  if (tokenIds.length === 0) return;

  const pawns = await api.multiCall({
    abi: "function pawns(uint256) view returns (address borrower, uint256 amount, uint256 deadline, uint16 feeBasisPoints, bool active)",
    target: PAWNSHOP,
    calls: tokenIds,
  });

  let outstanding = 0n;
  for (const p of pawns) {
    if (p.active) outstanding += BigInt(p.amount);
  }
  if (outstanding > 0n) api.add(usdc, outstanding.toString());
}

module.exports = {
  methodology:
    "TVL is the USDC held in Shiny's Treasury plus the value of outstanding pawns -- USDC the protocol has disbursed against NFTs currently held in the Pawnshop. Outstanding pawn value is read live from the Pawnshop's pawns(tokenId) view for every tokenId emitted in TokenPawned events.",
  base: { tvl },
  abstract: { tvl },
};
