const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const baseLedgerAbi = require("./baseLedgerPoolAbi.json");
const savingsPoolAbi = require("./savingsPoolAbi.json");
const savingsPlusPoolAbi = require("./savingsPlusPoolAbi.json");

const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { transformPolygonAddress } = require('../helper/portedTokens');


const treasuryContract = "0x94F748BfD1483750a7dF01aCD993213Ab64C960F";
const MOVER = "0x3FA729B4548beCBAd4EaB6EF18413470e6D5324C";
const MOVER_WETH_SLP = "0x87b918e76c92818DB0c76a4E174447aeE6E6D23f";

const savingsPool = "0xAF985437DCA19DEFf89e61F83Cd526b272523719";
const savingsPlusPolygonPool = "0x77D5333d97A092cA01A783468E53E550C379dc3C";
const USDC = ADDRESSES.ethereum.USDC;
const USDCinPolygon = ADDRESSES.polygon.USDC;
const baseLedgerPool = '0x1f15F293C1Cd3d05d58d3EdeAf0C72c5A2dfeaFf';
const UBT = '0x8400D94A5cb0fa0D041a3788e395285d61c9ee5e';

async function tvlEth(timestamp, block) {
  const balances = {};

  let stakedUBT = (await sdk.api.abi.call({
    abi: baseLedgerAbi.totalAssetAmount,
    target: baseLedgerPool,
    block
  })).output;

  sdk.util.sumSingleBalance(balances, UBT, stakedUBT);


  let savingsStakedUSDC = (await sdk.api.abi.call({
    abi: savingsPoolAbi.totalAssetAmount,
    target: savingsPool,
    block
  })).output;

  sdk.util.sumSingleBalance(balances, USDC, savingsStakedUSDC);
  return balances;
}

async function tvlPolygon(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();

  let savingsPlusStakedUSDC = (await sdk.api.abi.call({
    chain: "polygon",
    abi: savingsPlusPoolAbi.totalAssetAmount,
    target: savingsPlusPolygonPool,
    block: chainBlocks["polygon"],
  })).output;

  sdk.util.sumSingleBalance(balances, transform(USDCinPolygon), savingsPlusStakedUSDC);
  return balances;
}

module.exports = {
  ethereum: {
    staking: staking(treasuryContract, MOVER),
    pool2: pool2(treasuryContract, MOVER_WETH_SLP),
    tvl: tvlEth,
  },
  polygon: {
    tvl: tvlPolygon
  },
  methodology:
    "Counts tvl of the Assets deposited through get total assets methods of pools; also the Staking and Pool2 parts through Treasury Contract",
};

