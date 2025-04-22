const portalsContractAddress = "0x24b7d3034C711497c81ed5f70BEE2280907Ea1Fa";
const portalsV2 = {
  USDC: "0x9167CFf02D6f55912011d6f498D98454227F4e16",
  USDCE: "0xE8EfFf304D01aC2D9BA256b602D736dB81f20984",
  ETH: "0xe771545aaDF6feC3815B982fe2294F7230C9c55b",
  WBTC: "0x919B37b5f2f1DEd2a1f6230Bf41790e27b016609",
  ARB: "0x523a93037c47Ba173E9080FE8EBAeae834c24082",
  LINK: "0x51623b54753E07Ba9B3144Ba8bAB969D427982b6",
};

async function tvl(api) {
  const vaults = [portalsContractAddress, ...Object.values(portalsV2)]
  const bals = await api.multiCall({  abi: 'uint256:totalPrincipalStaked', calls: vaults})
  const tokens = await api.multiCall({  abi: 'address:PRINCIPAL_TOKEN_ADDRESS', calls: vaults})
  api.add(tokens, bals)
}

module.exports = {
  methodology:
    "TVL is equal to the amount staked in the Portals V1 and Portals V2 contracts.",
  arbitrum: { tvl },
  hallmarks: [
    [1715776637, "Portals V2 Launch"],
  ],
};
