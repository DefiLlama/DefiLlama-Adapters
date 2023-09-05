const USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const FACTORY = "0x649b80892ef773bd64cc3c663950dea3a604f660";
const VAULTS = [
  "0x0959ccb9722Fd632E756c36d990fCF0cC44080a0",
  "0x0B9BbACffEefD0179eE2eF706EF32c9258E8bEE3",
  "0x40A74703bB0a69c6Dcc418035a3fDfE2fcFB1C1A",
  "0xFd2126E715212fC9a9a587321D4C887C71D015a8",
]

async function tvl(_, _1, _2, { api }) {
  for (var vault of VAULTS) {
    const vaultBalance = await api.call({
      abi: "erc20:balanceOf",
      target: USDC,
      params: [vault],
    });
    api.add(USDC, vaultBalance);
  }
}

module.exports = {
  timetravel: false,
  base: {
    tvl,
  },
}
