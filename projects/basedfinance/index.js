const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { default: BigNumber } = require("bignumber.js");
const {totalRewardDebtInDollars} = require("./nodes_abi.json");

//BASED V1
const acropolisAddress = "0xe5009dd5912a68b0d7c6f874cd0b4492c9f0e5cd";
const bshareTokenAddress = "0x49c290ff692149a4e16611c694fded42c954ab7a";
const bshareRewardPoolAddress = "0xac0fa95058616d7539b6eecb6418a68e7c18a746";
//BASED V1 LPs
const basedTombLpAddress = "0xab2ddcbb346327bbdf97120b0dd5ee172a9c8f9e";
const bshareFtmLpAddress = "0x6f607443dc307dcbe570d0ecff79d65838630b56";
const basedBshareLpAddress = "0x5748b5Dd1f59342f85d170c48C427959c2f9f262";
const basedMaiTSwapLpAddress = "0x7B5B3751550be4FF87aC6bda89533F7A0c9825B3";
const basedTombTSwapLpAddress = "0x172BFaA8991A54ABD0b3EE3d4F8CBDab7046FF79";
const basedUsdcTSwapLpAddress = "0x7c849a7E2cb08f09cf37482cc0A04ecB5891844a";
const g3CrvAddress = "0xd02a30d33153877bc20e5721ee53dedee0422b2f";
const crv3CryptoAddress = "0x58e57cA18B7A47112b877E31929798Cd3D703b0f";

const poolLPs = [
    basedTombLpAddress,
    bshareFtmLpAddress,
    basedBshareLpAddress,
    basedMaiTSwapLpAddress,
    basedTombTSwapLpAddress,
    basedUsdcTSwapLpAddress,
    g3CrvAddress,
    crv3CryptoAddress
  ];

//BASED V2
const obol = "0x1539C63037D95f84A5981F96e43850d1451b6216";
const smelt = "0x141FaA507855E56396EAdBD25EC82656755CD61e";
const Boardroom = "0x8ff9eFB99D522fAC6a21363b7Ca54d25477637F6";
const SmeltRewardPool = "0x66d1C92f2319C67DA822BAe1Ef33b2C85C391a7b";
const usdc = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
const usdcFtmLp = "0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c";
const wftm = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
const godNft = '0xc5777AD2250D7b12a3f2383afB4464b9E49bE297';
const lps = [
    "0x47FcE13359ac80Cc1FC98D46688701B2Bb54300C", // OBOL - FTM LP 
    "0x02E060A4B8453C5dA554d66c2035e3163D453daA", // SMELT - FTM LP
]

//BASED V2 Twisted Nodes
const shortNodes = "0xAEbfF260074782a3DfD8981352b44767A05fa2eD";
const mediumNodes = "0x525ca3877a78c6AE12292D0a55765775e3943379";
const longNodes = "0x62A2Ff4BcCC5dD5316C358cDF079EC5e5c0851fe";

const chain = 'fantom'

//BASED V1 BshareRewardPool
async function bshareRewardPoolTVL(timestamp, _b, { [chain]: block }) {
    return sumTokens2({
        chain, block, owner: bshareRewardPoolAddress, tokens: poolLPs, resolveLP: true,
      })
  }

//BASED V2 TwistedNodes TVL
async function pool2(timestamp, _b, { [chain]: block }) {
    let balances = {}

    const usdcBalance = (await sdk.api.erc20.balanceOf({
        target: usdc,
        owner: usdcFtmLp,
        block,
        chain
    })).output;

    const wftmBalance = (await sdk.api.erc20.balanceOf({
        target: wftm,
        owner: usdcFtmLp,
        block,
        chain
    })).output;

    const usdcBal = Number(BigNumber(usdcBalance).times(BigNumber(10).pow(12)));
    const ftmBal = Number(BigNumber(wftmBalance));
    const usdcPriceInFtm = usdcBal / ftmBal;

    const totalRewardDebtShortNode = (await sdk.api.abi.call({
        target: shortNodes,
        abi: totalRewardDebtInDollars,
        block,
        chain
    })).output;


    const totalRewardDebtMediumNode = (await sdk.api.abi.call({
        target: mediumNodes,
        abi: totalRewardDebtInDollars,
        block,
        chain
    })).output;

    const totalRewardDebtLongNode = (await sdk.api.abi.call({
        target: longNodes,
        abi: totalRewardDebtInDollars,
        block,
        chain
    })).output;
    
    const usdcShortNode = Number(BigNumber(totalRewardDebtShortNode).div(BigNumber(10).pow(6)));
    const usdcMediumNode = Number(BigNumber(totalRewardDebtMediumNode).div(BigNumber(10).pow(6)));
    const usdcLongNode = Number(BigNumber(totalRewardDebtLongNode).div(BigNumber(10).pow(6)));
    
    const balance = (usdcShortNode + usdcMediumNode + usdcLongNode) / usdcPriceInFtm;
    sdk.util.sumSingleBalance(balances, 'fantom', balance);
    return balances;
  }

//BASED V2 Calc NFT TVL from SmeltRewardPool with Fixed price $500
async function nftTVL(timestamp, _b, { [chain]: block }) {
    let balances = {}

    const usdcBalance = (await sdk.api.erc20.balanceOf({
        target: usdc,
        owner: usdcFtmLp,
        block,
        chain
    })).output;

    const wftmBalance = (await sdk.api.erc20.balanceOf({
        target: wftm,
        owner: usdcFtmLp,
        block,
        chain
    })).output;

    const usdcBal = Number(BigNumber(usdcBalance).times(BigNumber(10).pow(12)));
    const ftmBal = Number(BigNumber(wftmBalance));
    const usdcPriceInFtm = usdcBal / ftmBal;

    const nftBalance = (await sdk.api.erc20.balanceOf({
        target: godNft,
        owner: SmeltRewardPool,
        block,
        chain
    })).output;
    
    const nftPrice = 500 / usdcPriceInFtm; //$500 - NFT fix price
    const balance = nftBalance * nftPrice;
 
    sdk.util.sumSingleBalance(balances, 'fantom', balance);
    return balances;
  }

//BASED V2 SmeltRewardPool TVL
async function smeltRewardPoolTVL(timestamp, _b, { [chain]: block }) {
    return sumTokens2({
        chain, block, owner: SmeltRewardPool, tokens: lps, resolveLP: true,
      })
  }

module.exports = {
    methodology: "Pool2 consists of Nodes TVL, staking consists of Boardroom TVL (Smelt staked)",
    fantom: {
        tvl: sdk.util.sumChainTvls([
            nftTVL,
            staking(acropolisAddress, bshareTokenAddress, "fantom"), //BASED V1 Acropolis
            bshareRewardPoolTVL,
            smeltRewardPoolTVL
        ]),
        staking: staking(Boardroom, smelt, chain),
        pool2,
    }
} 