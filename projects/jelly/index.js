const sdk = require('@defillama/sdk');
const { getBlock } = require("../helper/getBlock");
const { requery } = require("../helper/requery");
const getReserves = require('../helper/abis/getReserves.json');
const token0Abi = require('../helper/abis/token0.json');
const token1Abi = require('../helper/abis/token1.json');
const { balanceOf } = require('../helper/abis/erc20.json');
const abi = require('./abi.json');
const { default: BigNumber } = require('bignumber.js');


const factory = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac"
const jelly = "0xf5f06fFa53Ad7F5914F493F16E57B56C8dd2eA80"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const jellyUsdcLP = "0x64C2F792038f1FB55da1A9a22749971eAC94463E"
const sweetPool = '0xF897C014a57298DA3453f474312079cC6cB140c0'
const royalPool = '0xcC43331067234a0014d298b5226A1c22cb0ac66a'
const lpDecimals = 18


module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL accounts for the liquidity on Sushiswap. Staking accounts for the JELLY locked in our farming contracts',
  ethereum: {
    tvl: tvl("ethereum"),
    staking: staking([sweetPool, royalPool], "ethereum"),
  },
}

function tvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks);
    const pairAddress = (
      await sdk.api.abi.call({
        target: factory,
        abi: abi.getPair,
        params: [jelly, USDC],
        chain,
        block,
      })
    ).output;

    const [token0Address, token1Address, reserves] = await Promise.all([
      sdk.api.abi
        .call({
          abi: token0Abi,
          target: pairAddress,
          block,
        })
        .then(({ output }) => output),
      sdk.api.abi
        .call({
          abi: token1Abi,
          target: pairAddress,
          block,
        })
        .then(({ output }) => output),
      sdk.api.abi
        .call({
          abi: getReserves,
          target: pairAddress,
          block,
        })
        .then(({ output }) => output),
    ]);

    const balances = {
      [token0Address]: reserves[0],
      [token1Address]: reserves[1],
    }
    return balances
  }
}

function staking(stakingContracts, chain) {
  return async (timestamp, _ethBlock, chainBlocks) => {
      const block = await getBlock(timestamp, chain, chainBlocks, true)
      const usdcDecimals = 6
      const [balances, totalSupply, lpUsdcBalance] = await Promise.all([
        sdk.api.abi.multiCall({
          calls: stakingContracts.map((c) => ({
            target: jellyUsdcLP,
            params: [c],
          })),
          chain,
          block,
          abi: balanceOf,
        }),
        sdk.api.abi
          .call({
            target: jellyUsdcLP,
            abi: abi.totalSupply,
            chain,
            block,
          })
          .then((o) => o.output),
        sdk.api.erc20
          .balanceOf({ target: USDC, owner: jellyUsdcLP, block, chain })
          .then((o) => o.output),
      ]);
  
      await requery(balances, chain, block, balanceOf);
  
      const balance = balances.output.reduce((total, call)=> BigNumber(total).plus(call.output).toFixed(0), "0")
      const pricePerLp = BigNumber(lpUsdcBalance)
        .multipliedBy(2)
        .dividedBy(10**usdcDecimals)
        .dividedBy(BigNumber(totalSupply).dividedBy(10**lpDecimals))
        .toString();

      const normalizedBalance = balance / 10 ** lpDecimals
      const stakedBal = BigNumber(normalizedBalance).multipliedBy(pricePerLp)

      return toUsdcBalance(stakedBal)
  }
}

function toUsdcBalance(balance) {
  return {
    [USDC]: BigNumber(balance).multipliedBy(1e6).toFixed(0)
  }
}
