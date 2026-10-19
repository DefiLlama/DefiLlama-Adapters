const ADDRESSES = require('../helper/coreAssets.json')

const chainConfig = {
  celo: {
    contract: "0xbE50Daf0b6F3511a3fc07bb50bDa7a371e9A5238",
    tokens: [
      ADDRESSES.celo.USDC,
      ADDRESSES.celo.USDT_1,
      "0x8A567e2aE79CA692Bd748aB832081C45de4041eA", // COPm
    ],
  },
  arbitrum: {
    contract: "0xE7EE4a509B65CDA409DC43b2f4a8ebE1bfa5A76f",
    tokens: [
      ADDRESSES.arbitrum.USDC_CIRCLE,
      ADDRESSES.arbitrum.USDT,
    ],
  },
  polygon: {
    contract: "0x18d6e64B5Acd9C8e4695Bb0014842684bC5A3cb0",
    tokens: [
      ADDRESSES.polygon.USDC_CIRCLE,
      ADDRESSES.polygon.USDT,
    ],
  },
  ethereum: {
    contract: "0x828f442bcf60D8eFcf3e7cFf11Bfb7C15318B9de",
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
    ],
  },
  bsc: {
    contract: "0xbcE4Cc7aE832a76039dd831CE1AcF232333E57B9",
    tokens: [
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
    ],
  },
  base: {
    contract: "0x866165d601406B6bAB78B431f84746d510Ee82bc",
    tokens: [
      ADDRESSES.base.USDC,
    ],
  },
};

async function tvl(api) {
  const { contract, tokens } = chainConfig[api.chain];
  const balances = await api.multiCall({
    abi: "function getTotalLocked(address token) view returns (uint256)",
    calls: tokens.map((token) => ({ target: contract, params: [token] })),
  });
  api.addTokens(tokens, balances);
}

module.exports = {
  methodology:
    "TVL = funds locked on-chain in the P2PEscrow contract while peer-to-peer trades are in progress (open sell orders with a deposit and active deals). Reads getTotalLocked(token) for each supported stablecoin on each chain. Excludes protocol fees already collected, which accrue separately and are withdrawn by the owner.",
  celo: { tvl },
  arbitrum: { tvl },
  polygon: { tvl },
  ethereum: { tvl },
  bsc: { tvl },
  base: { tvl },
};
