const chainConfig = {
  celo: {
    contract: "0xbE50Daf0b6F3511a3fc07bb50bDa7a371e9A5238",
    tokens: [
      "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", // USDC
      "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", // USDT
      "0x8A567e2aE79CA692Bd748aB832081C45de4041eA", // COPm
    ],
  },
  arbitrum: {
    contract: "0xE7EE4a509B65CDA409DC43b2f4a8ebE1bfa5A76f",
    tokens: [
      "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
      "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT0
    ],
  },
  polygon: {
    contract: "0x18d6e64B5Acd9C8e4695Bb0014842684bC5A3cb0",
    tokens: [
      "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
      "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // USDT0
    ],
  },
  ethereum: {
    contract: "0x828f442bcf60D8eFcf3e7cFf11Bfb7C15318B9de",
    tokens: [
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    ],
  },
  bsc: {
    contract: "0xbcE4Cc7aE832a76039dd831CE1AcF232333E57B9",
    tokens: [
      "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC (Binance-Peg, 18 dec)
      "0x55d398326f99059fF775485246999027B3197955", // USDT
    ],
  },
  base: {
    contract: "0x866165d601406B6bAB78B431f84746d510Ee82bc",
    tokens: [
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
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
    "TVL = fondos bloqueados on-chain en el contrato de escrow P2PEscrow mientras hay operaciones peer-to-peer en curso (ordenes de venta abiertas con deposito y deals activos). Se lee getTotalLocked(token) por cada stablecoin soportada en cada red. No incluye fees ya cobrados por el protocolo, que se acumulan aparte y se retiran por el owner.",
  celo: { tvl },
  arbitrum: { tvl },
  polygon: { tvl },
  ethereum: { tvl },
  bsc: { tvl },
  base: { tvl },
};
