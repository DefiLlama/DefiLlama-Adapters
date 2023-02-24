const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs, sumBalancerLps } = require("../helper/unwrapLPs");
const {transformPolygonAddress} = require('../helper/portedTokens.js');
const { staking } = require("../helper/staking");
const { getCurrentTokens } = require("../balancer/abi.json")
const BigNumber = require('bignumber.js')

const wETHonEth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const axiaPoly = '0x49690541e3f6e933a9aa3cffee6010a7bb5b72d7'
const lonePoolPoly = '0x6c43cd84f2199eef1e7fcf169357b6c7948efe03'
const swapPoolPoly = '0xabf1dafecc1d8b3949092bab9dff8da7d63c69b1'
const swapPoolLPoly = '0xfa447eec17206c4948cba28a229346af925c2b07'

const axiaEth = '0x793786e2dd4cc492ed366a94b88a3ff9ba5e7546'
const lonelyPoolEth = '0x9dEd3b9d0bd9cc4DE698dcebeBb68b1f0033c0C8'
const swapPoolEth = '0xA5130fc368cAAd25450cB5aD1D3718BAB7e558dA'
const swapPoolLPEth = '0x1e0693f129D05E5857A642245185ee1fca6A5096'
const defiFundEth = '0x2b79d8dCbF26c5B690145130006Be06D1324C2b2'
const defiFundLPEth = '0x4833e8b56fc8e8a777fcc5e37cb6035c504c9478'
const oracleFundEth = '0x152959A2f50D716707fEa4897e72C554272dC584'
const oracleFundLPEth = '0xbf11db4e63c72c5dffde0f5831d667817c9e9ad5'


async function calculatePolygonTvl(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.split(',').map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  return balances;
}

const polygonTvl = async (timestamp, block, chainBlocks) => {
  return await calculatePolygonTvl(swapPoolPoly, swapPoolLPoly, chainBlocks.polygon, "polygon");
}

async function calculateEthereumTvl(masterchef, lps, block, chain) {
  let balances = {};

  //Swap Fund
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.split(',').map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );

  //Defi Fund
  const defiFundTokensEth = (await sdk.api.abi.call({
      abi: getCurrentTokens,
      target: defiFundLPEth,
      chain,
      block,
    })).output;
  
  const defiFundBalanceEth = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain,
        target: defiFundLPEth,
        params: defiFundEth,
        block,
      })).output;

  const defiFundSupplyEth = (await sdk.api.abi.call({
      abi: 'erc20:totalSupply',
      target: defiFundLPEth,
      chain,
      block,
    })).output;

  const defiFundStakedSharesEth = defiFundBalanceEth / defiFundSupplyEth

  const defiFundLPUnderlyingBalanceEth = await sdk.api.abi.multiCall({
  calls: defiFundTokensEth.map(token => ({
    target: token,
    params: [defiFundLPEth]
  })),
  abi: 'erc20:balanceOf',
  block,
  });

  async function getDefiFundUnderlyingBalanceEth () {
    await defiFundLPUnderlyingBalanceEth;
    console.log(defiFundLPUnderlyingBalanceEth)
    console.log(defiFundLPUnderlyingBalanceEth.output.map(outs => outs.output))
    defiFundLPUnderlyingBalanceEth.output.map(outs => outs.output = BigNumber(outs.output * defiFundStakedSharesEth).toFixed());
  console.log(defiFundLPUnderlyingBalanceEth)}
  await getDefiFundUnderlyingBalanceEth();

  sdk.util.sumMultiBalanceOf(balances, defiFundLPUnderlyingBalanceEth);

  //Oracle Fund
  const oracleFundTokensEth = (await sdk.api.abi.call({
      abi: getCurrentTokens,
      target: oracleFundLPEth,
      chain,
      block,
    })).output;
  
  const oracleFundBalanceEth = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain,
        target: oracleFundLPEth,
        params: oracleFundEth,
        block,
      })).output;

  const oracleFundSupplyEth = (await sdk.api.abi.call({
      abi: 'erc20:totalSupply',
      target: oracleFundLPEth,
      chain,
      block,
    })).output;

  const oracleFundStakedSharesEth = oracleFundBalanceEth / oracleFundSupplyEth

  const oracleFundLPUnderlyingBalanceEth = await sdk.api.abi.multiCall({
  calls: oracleFundTokensEth.map(token => ({
    target: token,
    params: [oracleFundLPEth]
  })),
  abi: 'erc20:balanceOf',
  block,
  });

  async function getOracleFundUnderlyingBalanceEth () {
    await oracleFundLPUnderlyingBalanceEth;
    console.log(oracleFundLPUnderlyingBalanceEth)
    console.log(oracleFundLPUnderlyingBalanceEth.output.map(outs => outs.output))
    oracleFundLPUnderlyingBalanceEth.output.map(outs => outs.output = BigNumber(outs.output * oracleFundStakedSharesEth).toFixed());
  console.log(oracleFundLPUnderlyingBalanceEth)}
  await getOracleFundUnderlyingBalanceEth();

  sdk.util.sumMultiBalanceOf(balances, oracleFundLPUnderlyingBalanceEth);
  
  return balances;
}


const ethereumTvl = async (timestamp, ethBlock) => {
  return await calculateEthereumTvl(swapPoolEth, swapPoolLPEth, ethBlock, "ethereum");
}

module.exports = {
  polygon:{
    tvl: polygonTvl,
    staking: staking(lonePoolPoly, axiaPoly, "polygon")
  },

  ethereum: {
    tvl: ethereumTvl,
    staking: staking(lonelyPoolEth, axiaEth, "ethereum"),
  }
}
