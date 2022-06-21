const sdk = require("@defillama/sdk");
const abi = require("../sperax/abi.json");
const BigNumber = require("bignumber.js");
const { staking } = require("../helper/staking.js");

const ethStakingAddr = "0xbF82a3212e13b2d407D10f5107b5C8404dE7F403";
const arbStakingAddr = "0x2e2071180682Ce6C247B1eF93d382D509F5F6A17";

const vaultcore = '0xF783DD830A4650D2A8594423F123250652340E3f'
const collateralTokens = [
  '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
  '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT 
]
const strategyArr = [
  '0xbF82a3212e13b2d407D10f5107b5C8404dE7F403', // Strategy （TwoPoolStrategy） for USDC
  '0xdc118F2F00812326Fe0De5c9c74c1c0c609d1eB4', // Strategy （TwoPoolStrategy） for USDT
]

const SPA = '0x5575552988a3a80504bbaeb1311674fcfd40ad4b'
const ethSPA = '0xB4A3B0Faf0Ab53df58001804DdA5Bfc6a3D59008'

async function tvl (timestamp, ethBlock, chainBlocks) {
  const chain = 'arbitrum'
  const block = chainBlocks[chain]

  const allstrategyBalance = (
    await sdk.api.abi.multiCall({
      abi: abi.checkBalance,
      calls: strategyArr.map((item, index) => ({
        target: item,
        params: [collateralTokens[index]],
      })),
      chain,
      block,
    })
  ).output.map((o) => o.output);

  const collateralBalances = (await sdk.api.abi.multiCall({
      abi: "erc20:balanceOf",
      calls: collateralTokens.map((t) => ({
        target: t,
        params: [vaultcore],
      })),
      chain,
      block,
    })
  ).output.map((o) => o.output);

  const balances = {};
  function getBalance (balances) {
    for(let i =0; i < collateralTokens.length; i++) {
      sdk.util.sumSingleBalance(balances, `arbitrum:${collateralTokens[i]}`, (BigNumber(collateralBalances[i]).plus(BigNumber(allstrategyBalance[i]))).toFixed(0))
    }
  }
  getBalance(balances)
  console.log(balances)
  return balances
}

module.exports = {
  arbitrum: {
    tvl,
    staking: staking(arbStakingAddr,SPA,"arbitrum",`arbitrum:${SPA}`)
  },
  ethereum: {
    tvl: ()=>({}),
    staking: staking(ethStakingAddr,ethSPA)
  },
    methodology: 'Counts all collaterals - USDC, USDT at the moment - locked to mint USDs. These collaterals are either stored in VaultCore contract of USDs protocol, or deposited into Curve’s USDC-USDT pool. Some TVL are classified as staking. This component of TVL consists of all SPA locked in Sperax’s veSPA protocol.'
};