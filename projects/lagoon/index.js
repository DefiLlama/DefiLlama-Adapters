const config = {
  ethereum: {
    vaults: 
       [
        "0x07ed467acD4ffd13023046968b0859781cb90D9B", // 9Summits Flagship ETH
        "0x03D1eC0D01b659b89a87eAbb56e4AF5Cb6e14BFc", // 9Summits Flagship USDC
        "0xB09F761Cb13baCa8eC087Ac476647361b6314F98", // 9Summits & Tulipa Capital cbBTC 
        "0x8092cA384D44260ea4feaf7457B629B8DC6f88F0", // Usual Invested USD0++ in stUSR
        "0x66dCB62da5430D800a1c807822C25be17138fDA8", // Unity Trust
        "0x71652D4898DE9A7DD35e472a5fe4577eC69d82f2", // Trinity Trust
        "0x7895a046b26cc07272b022a0c9bafc046e6f6396", // Noon tacUSN
        "0x8245FD9Ae99A482dFe76576dd4298f799c041D61", // Usual Invested USD0++ in USCC & USTB
        "0xaf87b90e8a3035905697e07bb813d2d59d2b0951", // Usual Invested USD0++ in TAC
      ],
    factory: "",
  },
  base: {
    vaults: [
        "0xFCE2064B4221C54651B21c868064a23695E78f09", // 722Capital-ETH
        "0x8092cA384D44260ea4feaf7457B629B8DC6f88F0", // DeTrade Core USDC
        "0xB09F761Cb13baCa8eC087Ac476647361b6314F98", // 722Capital-USDC
      ],
    factory: "",
  },
  arbitrum: {
    vaults:  [
        "0x99CD0b8b32B15922f0754Fddc21323b5278c5261", // Yield Algo Trading
      ],
    factory: ""
  }
};

Object.keys(config).forEach((chain) => {
  const {vaults} = config[chain];
  console.log(vaults);
  module.exports[chain] = { 
    tvl: async (api) =>  {
      return api.erc4626Sum2({
        calls: vaults,
      })
    }
}}
)