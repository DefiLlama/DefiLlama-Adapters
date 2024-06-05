const portalsContractAddress = "0x24b7d3034C711497c81ed5f70BEE2280907Ea1Fa";
const timeRiftContractAddress = "0x6df4EF024089ab148078fdD88f5BF0Ee63248D3E";
const hlpToken = "0x4307fbDCD9Ec7AEA5a1c2958deCaa6f316952bAb";
const flashToken = "0xc628534100180582E43271448098cb2c185795BD";
const portalsV2 = {
  USDC: "0x9167CFf02D6f55912011d6f498D98454227F4e16",
  USDCE: "0xE8EfFf304D01aC2D9BA256b602D736dB81f20984",
  ETH: "0xe771545aaDF6feC3815B982fe2294F7230C9c55b",
  WBTC: "0x919B37b5f2f1DEd2a1f6230Bf41790e27b016609",
  ARB: "0x523a93037c47Ba173E9080FE8EBAeae834c24082",
  LINK: "0x51623b54753E07Ba9B3144Ba8bAB969D427982b6",
};

const tokens = {
  USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  USDCE: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
  ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
};

async function tvl(api) {
  const portalsStaked = await api.call({
    target: portalsContractAddress,
    abi: "uint256:totalPrincipalStaked",
  });
  const ethStaked = await api.call({
    target: portalsV2.ETH,
    abi: "uint256:totalPrincipalStaked",
  });

  const v2Staked = await api.multiCall({
    calls: Object.values(portalsV2).map((target) => ({
      target,
    })),
    abi: "uint256:totalPrincipalStaked",
  });

  api.add(hlpToken, portalsStaked);
  api.add(Object.values(tokens), v2Staked);
}

module.exports = {
  methodology:
    "TVL is equal to the amount staked in the Portals V1 and Portals V2 contracts.",
  arbitrum: { tvl },
  hallmarks: [
    [1701359809, "Portals V1 Launch"],
    [1704302065, "Time Rift Launch"],
    [1715776637, "Portals V2 & Adapters Launch"],
  ],
};
