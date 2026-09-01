const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const gmothTokenAddress = "0x0c62358178D086ad87717B0d401235628D21a62b"; // done
const mothGenesisAddress = '0xb1b12d9B379652690e7cAb154163758d88C76366' // done
const gmothRewardPoolAddress = "0x22d147fed73dc0B381Be25ffDa6F091F81C6Cf74"; // done
const masonryAddress = "0xc1Bfa275DCa704a1FF11783Da42c6D0E46F9e20C"; // done

async function mothGenesisTVL(api) {
  const tokens = [
    ADDRESSES.linea.WETH, // ETH
    ADDRESSES.linea.USDC, // USDC
    ADDRESSES.linea.USDT, // USDT
    "0xe4eEB461Ad1e4ef8b8EF71a33694CCD84Af051C4", // REX33
    "0xC326D1505ce0492276f646B03FE460c43A892185", // U$D
    "0x8cf881799E3B5ab24271A9B66b6Ca2b0e575B1ef", // fBOMB

  ]

  return sumTokens2({ api, tokens, owner: mothGenesisAddress, })
}


const pool2 = async (api) => {
  let gauges = await api.call({ abi: 'address[]:getAllGauges', target: '0x942117Ec0458a8AA08669E94B52001Bd43F889C1' })
  let pools = await api.multiCall({ abi: 'address:stake', calls: gauges, permitFailure: true })
  const pools2 = []
  const gauges2 = []
  pools.forEach((pool, i) => {
    if (!pool) return;
    pools2.push(pool)
    gauges2.push(gauges[i])
  })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: gauges2.map(gauge => ({ target: gauge, params: gmothRewardPoolAddress })) })
  api.add(pools2, bals)
  return sumTokens2({ api, tokens: pools2, })
};


module.exports = {
  methodology: "Pool2 deposits consist of MOTH/USDC and GMOTH/USDC LP tokens deposits while the staking TVL consists of the GMOTH tokens locked within the Masonry contract(0xc1Bfa275DCa704a1FF11783Da42c6D0E46F9e20C).",
  linea: {
    tvl: mothGenesisTVL,
     pool2, // comment out until pool2 tokens are available
    staking: staking(masonryAddress, gmothTokenAddress),
  },
};