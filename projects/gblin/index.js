const GBLIN_VAULT = "0xED334B4CDaFCAe6D42bb9A57DE565fD3e9640a50";

const WETH = "0x4200000000000000000000000000000000000006";
const cbBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function tvl(api) {
  return api.sumTokens({
    owner: GBLIN_VAULT,
    tokens: [WETH, cbBTC, USDC]
  });
}

module.exports = {
  methodology: "TVL is calculated by summing the balances of WETH, cbBTC, and USDC strictly locked as backing collateral inside the GBLIN V4 Vault contract on Base.",
  base: {
    tvl
  }
};
