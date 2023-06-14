const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking, stakings } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { transformPolygonAddress } = require("../helper/portedTokens");

/*** Ethereum Addresses ***/
const stakingContract = "0xDb3130952eD9b5fa7108deDAAA921ae8f59beaCb";
const GOVI = "0xeeaa40b28a2d1b0b08f6f97bb1dd4b75316c6107";

const stakingPool2Contracts = [
  "0x936Dd3112a9D39Af39aDdA798503D9E7E7975Fb7",
  "0xcF05a60bCBC9c85cb2548DAfDC444c666A8F466a",
];

const lpPool2Addresses = [
  //WETH_GOVI_UNIV2
  "0x1EE312A6d5fe7b4B8c25f0a32fCA6391209eBEBF",
  //WETH_GOVI_SLP
  "0x7E6782E37278994d1e99f1a5d03309B4b249d919",
];

const ETHPlatform = "0x5005e8Dc0033E78AF80cfc8d10f5163f2FcF0E79";

const platformLiquidityContracts = [
  //USDTPlatform
  "0xe0437BeB5bb7Cf980e90983f6029033d710bd1da",
  //USDCPlatform
  "0x2167EEFB9ECB52fB6fCf1ff8f7dAe6F0121F4fBC",
  //ETHVIPlatform
  "0x0E0DA40101D8f6eB1b1d6b0215327e8452e0Bc60",
  //Liquidity Mining ETHVOL-USDC
  "0xa9f8754A34AeD9EfaB3d543ce199B4AaF6a506c7",
  //Liquidty Mining COTI-ETH
  "0xe6e5220291CF78b6D93bd1d08D746ABbC115C64b",
];

const USDT = ADDRESSES.ethereum.USDT;
const WETH = ADDRESSES.ethereum.WETH;
const USDC = ADDRESSES.ethereum.USDC;
const ETHVOL_USDC_UNIV2 = "0x197e99bD87F98DFde461afE3F706dE36c9635a5D";
const WETH_COTI_UNIV2 = "0xA2b04F8133fC25887A436812eaE384e32A8A84F2";

/*** Polygon Addresses ***/
const stakingContracts_polygon = [
  "0x399b649002277d7a3502C9Af65DE71686F356f33",
  "0xD013FFC6Ed3B2c773051a3b83E763dF782D7b31f",
];

const GOVI_polygon = "0x43df9c0a1156c96cea98737b511ac89d0e2a1f46";

const stakingPool2Contract_polygon =
  "0x27792cDa195d07ffb36E94e253D67361661a16Dc";
const lpPool2Address_polygon = "0x1dAb41a0E410C25857F0f49B2244Cd089AB88DE6";

const platformLiquidityContracts_polygon = [
  //usdtPlatPolygon
  "0x88D01eF3a4D586D5e4ce30357ec57B073D45ff9d",
  //usdcPlatPolygon
  "0x3863D0C9b7552cD0d0dE99fe9f08a32fED6ab72f",
  //liquidty Mining CVOL-USDC
  "0xEA7b8DC5615e049417C80C795eA652556971c423",
];
const USDT_Polygon = ADDRESSES.polygon.USDT;
const USDC_Polygon = ADDRESSES.polygon.USDC;
const CVOL_USDC_QLP = "0x1dd0095a169e8398448A8e72f15A1868d99D9348";

/*** Arbitrum Addresses ***/
const stakingContract_arbitrum = "0xDb3e7deAb380B43189A7Bc291fa2AFeAA938dCc3";
const GOVI_arbitrum = "0x07e49d5de43dda6162fa28d24d5935c151875283";

async function ethTvl(timestamp, block) {
  const balances = {};

  const ethBalance = (
    await sdk.api.eth.getBalance({
      target: ETHPlatform,
      block
    })
  ).output;

  sdk.util.sumSingleBalance(balances, WETH, ethBalance);

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDT, false],
      [USDC, false],
      [ETHVOL_USDC_UNIV2, true],
      [WETH_COTI_UNIV2, true],
    ],
    platformLiquidityContracts,
    block
  );

  return balances;
}

async function polygonTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const transformAddress = await transformPolygonAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDT_Polygon, false],
      [USDC_Polygon, false],
      [CVOL_USDC_QLP, true],
    ],
    platformLiquidityContracts_polygon,
    chainBlocks.polygon,
    "polygon",
    transformAddress
  );

  return balances;
}
async function arbiTvl(_, _b, _cb, { api, }) {
  const balances = {}
  const vaults = [
    '0xfdeb59a2b4891ea17610ee38665249acc9fcc506',
  ]
  const tokens = await api.multiCall({
    abi: 'address:token',
    calls: vaults,
  })
  const totalBalance = await api.multiCall({
    abi: 'function totalBalance() view returns (uint256 balance, uint256 usdcPlatformLiquidity, uint256 intrinsicDEXVolTokenBalance, uint256 volTokenPositionBalance, uint256 dexUSDCAmount, uint256 dexVolTokensAmount)',
    calls: vaults,
  })
  tokens.forEach((t, i) => sdk.util.sumSingleBalance(balances, t, totalBalance[i].balance, api.chain))
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(stakingContract, GOVI),
    pool2: staking(stakingPool2Contracts, lpPool2Addresses),
    tvl: ethTvl,
  },
  polygon: {
    staking: stakings(stakingContracts_polygon, GOVI_polygon, "polygon", GOVI),
    pool2: staking(
      stakingPool2Contract_polygon,
      lpPool2Address_polygon,
      "polygon"
    ),
    tvl: polygonTvl,
  },
  arbitrum: {
    staking: staking(stakingContract_arbitrum, GOVI_arbitrum, "arbitrum", GOVI),
    tvl: arbiTvl,
  },
  methodology:
    "Counts liquidity on the Platforms and Staking seccions through Platfrom and Staking Contracts",
};
