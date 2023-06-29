const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

// constants
const ETHER = new BigNumber(10).pow(18);

// ABIs
const dashBoardABI = 'function getTVLInfo() external view returns (tuple(uint256 earnTVL, uint256 collateralTVL, uint256 totalMintedWCD))'

// contracts
const poolList = [
  "0xa60448B0621335905a65753173D7e6FDFe494Da2", // k3Pool
  "0xDacaD9ddF713496012748D35496c0FB09c8d8c15", // wcd-k3Pool
]

const tokens = [
  "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D", // USDC
  "0xA649325Aa7C5093d12D6F98EB4378deAe68CE23F", // USDT
  "0x8E81fCc2d4A3bAa0eE9044E0D7E36F59C9BbA9c1", // WEMIX$
  "0x2ec6Fc5c495aF0C439E17268d595286d5f897dD0", // WCD
]


// functions
const tvl = async () => {
  const chain = "wemix"
  const balances = {}
  const transform = (address) => `${chain}:${address}`

  console.log("------------ START ------------")

  const poolBalance = await sdk.api.abi.multiCall({
    calls: tokens.map(token => ({
      target: token,
      params: poolList[0]
    })),
    chain: chain,
    abi: "erc20:balanceOf",
    withMetadata:true,
  })

  console.log(poolBalance)
  console.log(poolBalance.output[0].input)
  console.log(poolBalance.output[0].input.target)
  poolBalance.output.forEach(({input, output}) => sdk.util.sumSingleBalance(balances, input.target, output, chain))

  console.log(balances)

  // TODO metaPool

  return balances
}

module.exports = {
  timetravel: true,
  doublecounted: false,
  methodology:
    "Total value of CDP collaterals, deposited stablecoins in pegging module(PSM), and WCD staked in our vault",
  wemix: {
    tvl: tvl,
  },
};
