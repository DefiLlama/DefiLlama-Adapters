const CONFIG = {
  ethereum: [
    "0xa528639aae2e765351dcd1e0c2dd299d6279db52", // usdc
  ],
  avax: [
    "0x8B1Be96dc17875ee01cC1984e389507Bb227CaAB", // usdc.e
    "0xd96AbEcf6AA022735CFa9CB512d63645b0834720", // usdt.e
    "0xF74303DD14E511CCD90219594e8069d36Da01DCD", // dai.e
    "0xe001DeCc1763F8BadBbc1b10c2D6db0900f9B928", // usdc
    "0xB3ce618F43b53Cdc12077FB937f9fF465BcE1f60", // usdt
  ],
  moonriver: [
    "0x4C211F45876d8EC7bAb54CAc0e32AAD15095358A", // usdc
    "0xdeA7Ff1D84B7E54587b434C1A585718857CF61d1", // usdt
  ],
  metis: [
    "0x4C211F45876d8EC7bAb54CAc0e32AAD15095358A", // m.usdc
    "0xc53bC2517Fceff56308b492AFad4A53d96d16ed8", // m.usdt
  ],
};

const abi = {
  virtualBalance: "uint256:virtualBalance",
  underlying: "address:underlying",
};

async function getBankTvl(api, vaults) {
  const [investeds, underlyings] = await Promise.all([
    api.multiCall({ calls: vaults, abi: abi.virtualBalance, permitFailure: true }),
    api.multiCall({ calls: vaults, abi: abi.underlying, permitFailure: true }),
  ]);

  vaults.forEach((_vault, i) => {
    const invested = investeds[i]
    const underlying = underlyings[i]
    if (!invested || !underlying ) return
    api.add(underlying, invested)
  })

}

Object.keys(CONFIG).forEach((chain) => {
  const vaults = CONFIG[chain];
  module.exports[chain] = {
    tvl: (api) => getBankTvl(api, vaults),
  };
});
