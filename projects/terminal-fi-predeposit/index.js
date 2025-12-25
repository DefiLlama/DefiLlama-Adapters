const config = {
  ethereum: {
    tUSDe: "0xA01227A26A7710bc75071286539E47AdB6DEa417",
    tETH: "0xa1150cd4A014e06F5E0A6ec9453fE0208dA5adAb",
    tBTC: "0x6b6b870C7f449266a9F40F94eCa5A6fF9b0857E4",
  }
};

async function tvl(api) {
  const tokens = Object.values(config[api.chain]);
  const bals = await api.multiCall({
    abi: "uint256:totalSupply",
    calls: tokens,
  });
  api.add(tokens, bals);
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl };
});