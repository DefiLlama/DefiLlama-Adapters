const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require("bignumber.js");
const { sumTokensAndLPsSharedOwners, unwrapUniswapLPs } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");
const allocatorAbi = require("./allocatorAbi.json");
const pngStakingAbi = require("./stakingRewardsAbi.json");
const joeStakingAbi = require("./stableJoeStakingAbi.json");
const veptpAbi = require("./veptpAbi.json");
const qiTokenAbi = require("./qiTokenAbi.json");

const MaximizerStaking = "0x6d7AD602Ec2EFdF4B7d34A9A53f92F06d27b82B1";
const Treasury = "0x22cF6c46b4E321913ec30127C2076b7b12aC6d15";
const Deployer = "0xb2Fe117269292D41c3b5bdD6B600Fc80239AfBeC";
const PngAllocator = "0x1ff1E60e7af648DFE7B95E025214bfCd6f3D9524";
const JoeAllocator = "0x7613D00f7b49E514Ce84d6369EA12Cc98219Ed40";
const BenqiAllocator = '0x1e3834DA9a9B4d4016427554Ef31ff4e1F41d4Ed';

const MAXI = "0x7C08413cbf02202a1c13643dB173f2694e0F73f0";
const SMAXI = "0xEcE4D1b3C2020A312Ec41A7271608326894076b4";
const DAIe = ADDRESSES.avax.DAI;
const USDC = ADDRESSES.avax.USDC;
const USDCe = ADDRESSES.avax.USDC_e;
const WAVAX = ADDRESSES.avax.WAVAX;
const PNG = "0x60781C2586D68229fde47564546784ab3fACA982";
const QI = "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5";
const JOE = ADDRESSES.avax.JOE;
const XJOE = ADDRESSES.avax.xJOE;
const ISA = "0x3EeFb18003D033661f84e48360eBeCD181A84709";
const PTP = "0x22d4002028f537599bE9f666d1c4Fa138522f9c8";
const VEPTP = "0x5857019c749147EEE22b1Fe63500F237F3c1B692";
const MORE = "0xd9D90f882CDdD6063959A9d837B05Cb748718A05";
const MONEY = "0x0f577433Bf59560Ef2a79c124E9Ff99fCa258948";
const HEC = "0xC7f4debC8072e23fe9259A5C0398326d8EfB7f5c";
const SAVAX = ADDRESSES.avax.SAVAX;
const MAXI_DAI_JLP = "0xfBDC4aa69114AA11Fae65E858e92DC5D013b2EA9";
const MAXI_WAVAX_PGL = "0xbb700450811a30c5ee0dB80925Cf1BA53dBBd60A";
const PNG_WAVAX_PGL = "0xd7538cABBf8605BdE1f4901B47B8D42c61DE0367";
const QI_WAVAX_PGL = "0xE530dC2095Ef5653205CF5ea79F8979a7028065c";
const JOE_WAVAX_JLP = "0x454E67025631C065d3cFAD6d71E6892f74487a15";
const ISA_WAVAX_JLP = "0x9155f441FFDfA81b13E385bfAc6b3825C05184Ee";
const PTP_WAVAX_JLP = "0xCDFD91eEa657cc2701117fe9711C9a4F61FEED23";
const MORE_WAVAX_JLP = "0xb8361D0E3F3B0fc5e6071f3a3C3271223C49e3d9";
const HEC_WAVAX_JLP = "0x4dc5291cdc7ad03342994e35d0ccc76de065a566";
const AVAX_QITOKEN = "0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c";
const QI_QITOKEN = "0x35Bd6aedA81a7E5FC7A7832490e71F757b0cD9Ce";
const DAI_QITOKEN = "0x835866d37AFB8CB8F8334dCCdaf66cf01832Ff5D";
const USDC_QITOKEN = "0xB715808a78F6041E46d61Cb123C9B4A27056AE9C";
const SAVAX_QITOKEN = "0xF362feA9659cf036792c9cb02f8ff8198E21B4cB";

const PngStaking = "0x88afdaE1a9F58Da3E68584421937E5F564A0135b";
const JoeStaking = "0x1a731B2299E22FbAC282E7094EdA41046343Cb51";

const Allocators = [
  { allocator: PngAllocator, stakeToken: PNG, yieldToken: PNG, yieldStaking: PngStaking, abi: pngStakingAbi.balanceOf, params: [ PngAllocator ], transformResult: (result) => result.output },
  { allocator: JoeAllocator, stakeToken: JOE, yieldToken: JOE, yieldStaking: JoeStaking, abi: joeStakingAbi.getUserInfo, params: [ JoeAllocator, USDC ], transformResult: (result) => result.output.amount },
];
const Allocations = [
  { allocator: PngAllocator, token: PNG_WAVAX_PGL, pid: 0 },
  { allocator: PngAllocator, token: QI_WAVAX_PGL, pid: 19 },
  { allocator: PngAllocator, token: MAXI_WAVAX_PGL, pid: 42 },
  { allocator: JoeAllocator, token: JOE_WAVAX_JLP, pid: 0 },
  { allocator: JoeAllocator, token: ISA_WAVAX_JLP, pid: 36 },
  { allocator: JoeAllocator, token: HEC_WAVAX_JLP, pid: 41 },
  { allocator: JoeAllocator, token: MORE_WAVAX_JLP, pid: 44 },
];

const BenqiMarkets = [
  { qiToken: AVAX_QITOKEN, underlyingToken: WAVAX },
  { qiToken: QI_QITOKEN, underlyingToken: QI },
  { qiToken: DAI_QITOKEN, underlyingToken: DAIe },
  { qiToken: USDC_QITOKEN, underlyingToken: USDC },
  { qiToken: SAVAX_QITOKEN, underlyingToken: SAVAX },
];

const Tokens = [
  [MAXI, false],
  [SMAXI, false],
  [DAIe, false],
  [USDC, false],
  [WAVAX, false],
  [PNG, false],
  [QI, false],
  [JOE, false],
  [ISA, false],
  [PTP, false],
  [MORE, false],
  [MONEY, false],
  [HEC, false],
  [MAXI_DAI_JLP, true],
  [MAXI_WAVAX_PGL, true],
  [PNG_WAVAX_PGL, true],
  [QI_WAVAX_PGL, true],
  [JOE_WAVAX_JLP, true],
  [ISA_WAVAX_JLP, true],
  [PTP_WAVAX_JLP, true],
  [MORE_WAVAX_JLP, true],
  [HEC_WAVAX_JLP, true],
];

function compareToIgnoreCase(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

const transformAddress = (addr) => {
  let resultantAddress = addr;
  // sMAXI -> MAXI
  if (compareToIgnoreCase(addr, SMAXI)) {
    resultantAddress = MAXI;
  }
  // USDC -> USDC.e
  if (compareToIgnoreCase(addr, USDC)) {
    resultantAddress = USDCe;
  }
  // MONEY -> DAI
  if (compareToIgnoreCase(addr, MONEY)) {
    resultantAddress = DAIe;
  }
  // xJOE -> JOE
  if (compareToIgnoreCase(addr, XJOE)) {
    resultantAddress = JOE;
  }
  return `avax:${resultantAddress.toLowerCase()}`;
};

const chainConfig = (chainBlocks) => ({
  block: chainBlocks.avax,
  chain: "avax",
  transformAddress,
});

const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const stakingBalance = await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    target: MAXI,
    params: MaximizerStaking,
    block: chainBlocks.avax,
    chain: "avax",
  });

  sdk.util.sumSingleBalance(balances, "avax:" + MAXI, stakingBalance.output);

  return balances;
};

async function tvl(timestamp, block, chainBlocks) {
  const config = chainConfig(chainBlocks);
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    Tokens,
    [Treasury],
    config.block,
    config.chain,
    config.transformAddress,
  );

  const allocatedLps = await sdk.api.abi.multiCall({
    calls: Allocations.map(allocation => ({
      target: allocation.allocator,
      params: [allocation.token]
    })),
    abi: allocatorAbi.balanceOf,
    ...config,
  });
  
  await unwrapUniswapLPs(
    balances,
    Allocations.map((allocation, index) => ({
      balance: allocatedLps.output[index].output,
      token: allocation.token,
    })),
    config.block,
    config.chain,
    config.transformAddress,
  );

  const stakedYieldTokens = (await Promise.all(
    Allocators.map(allocator => (
      sdk.api.abi.call({
        target: allocator.yieldStaking,
        params: allocator.params,
        abi: allocator.abi,
        ...config,
      })
    ))
  )).map((result, index) => Allocators[index].transformResult(result));

  const pendingYieldTokens = (await sdk.api.abi.multiCall({
    calls: Allocators.map(allocator => ({
      target: allocator.allocator,
    })),
    abi: allocatorAbi.pending,
    ...config,
  })).output.map(result => result.output);

  for (const [index, allocator] of Allocators.entries()) {
    sdk.util.sumSingleBalance(balances, config.transformAddress(allocator.stakeToken), stakedYieldTokens[index]);
    sdk.util.sumSingleBalance(balances, config.transformAddress(allocator.yieldToken), pendingYieldTokens[index]);
  }

  for (const market of BenqiMarkets) {
    const [balance, exchangeRate] = await Promise.all([
      sdk.
      api.abi.call({ target: market.qiToken, abi: qiTokenAbi.balanceOf, params: [BenqiAllocator], ...config }),
      sdk.api.abi.call({ target: market.qiToken, abi: qiTokenAbi.exchangeRateStored, params: [], ...config }),
    ]);
    const underlyingTokenBalance = new BigNumber(balance.output).times(new BigNumber(exchangeRate.output)).div(new BigNumber(1e18));
    sdk.util.sumSingleBalance(balances, config.transformAddress(market.underlyingToken), underlyingTokenBalance.toFixed(0));
  }

  const stakedPtp = (await sdk.api.abi.call({
    target: VEPTP,
    abi: veptpAbi.getStakedPtp,
    params: [Deployer],
    ...config,
  })).output;
  sdk.util.sumSingleBalance(balances, config.transformAddress(PTP), stakedPtp);

  return balances;
}

module.exports = {
  avax:{
    tvl,
    staking,
  },
  methodology:
    "Counts MAXI, MAXI LP (MAXI-DAI.e JLP, MAXI-WAVAX PGL), DAI.e, USDC, WAVAX, liquidity tokens (PGL, JLP), single partner tokens on the treasury and allocators",
};
