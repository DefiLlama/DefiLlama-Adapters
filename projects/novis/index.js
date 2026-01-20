const VAULT = "0xA3D771bF986174D9cf9C85072cCD11cb72A694d4";
const PAYMENT_ROUTER = "0xc95D114A333d0394e562BD398c4787fd22d27110";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function tvl(api) {
  const totalBacking = await api.call({
    target: VAULT,
    abi: "function totalBackingUSDC() view returns (uint256)",
  });
  const routerUSDC = await api.call({
    target: USDC,
    abi: "erc20:balanceOf",
    params: [PAYMENT_ROUTER],
  });
  api.add(USDC, totalBacking);
  api.add(USDC, routerUSDC);
}

module.exports = {
  methodology: "TVL is the total USDC backing in the Vault (deposited to Compound V3 for yield generation) plus USDC held in escrow in the PaymentRouter contract.",
  base: { tvl },
};
