const abi = {
  "yCrvDistribution": "function yCrvDistribution() view returns (uint256 here, uint256 total)"
}

const IBBTC = "0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F";

const yCRV = "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8";
const yCrvPeak = "0xA89BD606d5DadDa60242E8DEDeebC95c41aD8986"

async function tvl(api) {
  const [ yCrvDistribution, ibbtcSupply ] = await Promise.all([
    api.call({
      target: yCrvPeak,
      abi: abi.yCrvDistribution
    }),
    api.call({
      abi: 'erc20:totalSupply',
      target: IBBTC,
    }),
  ])
  api.add(yCRV, yCrvDistribution)
  api.add(IBBTC, ibbtcSupply)
}

module.exports = {
  hallmarks: [
    [1641600000, "Possible exploit, contracts paused"]
  ],
  ethereum:{
    tvl
  },
};
