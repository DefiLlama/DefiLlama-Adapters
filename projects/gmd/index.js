const sdk = require('@defillama/sdk');
const uniV3Abi = require('../helper/abis/uniV3.json')
const abi = 'uint256:totalUSDvaults';

const arbitrum_vault = "0xA7Ce4434A29549864a46fcE8662fD671c06BA49a";
const arbitrum_vault2 = "0x8080B5cE6dfb49a6B86370d6982B3e2A86FBBb08";
const arbitrum_gmdbfr_vault = "0x56009e94418ddfe8604331eceff38db0738775f8";
const arbitrum_staking = "0x48c81451d1fddeca84b47ff86f91708fa5c32e93";
const arbitrum_GMD = "0x4945970EfeEc98D393b4b979b9bE265A3aE28A8B";
const arbitrum_esGMD = "0x49E050dF648E9477c7545fE1779B940f879B787A";
const arbitrum_gmd_usdc_pool = "0x7f9a20548d9482041dc33435a7fb25be7c4b98b9";
const arbitrum_usdc = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";

const avax_vault = "0x5517c5F22177BcF7b320A2A5daF2334344eFb38C"
const avax_staking = "0x4f2c414b76fd9cd45c000af7a449ade4125740ce";
const avax_GMD = "0x1FE70939c2cEc8F31E8F7729442658586B469972";
const avax_esGMD = "0xeE788a8b015376eC0185e1e40140af03029C8763";

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is calculated as the USD value reported by GMD vault contracts. Staking is calculated as GMD and esGMD held in the staking contracts, with esGMD counted as GMD-equivalent staked balance.',
  arbitrum: {
    staking: staking(arbitrum_staking, arbitrum_GMD, arbitrum_esGMD),
    tvl
  },
  avax: {
    staking: staking(avax_staking, avax_GMD, avax_esGMD),
    tvl
  },
};

const config = {
  avax: [avax_vault],
  arbitrum: [arbitrum_vault, arbitrum_vault2, arbitrum_gmdbfr_vault],
}

async function tvl(api) {
  const vaults = config[api.chain]
  const bals = (await api.multiCall({  abi , calls: vaults })).map(i=>i/1e18).reduce((a,b)=>a+b,0)
  api.addUSDValue(bals)
}

function staking(stakingContract, gmdToken, esGmdToken) {
  return async (api) => {
    const [gmdBal, esGmdBal] = await api.multiCall({
      abi: 'erc20:balanceOf',
      calls: [
        { target: gmdToken, params: [stakingContract] },
        { target: esGmdToken, params: [stakingContract] },
      ],
    })
    const { output: { sqrtPriceX96 } } = await sdk.api.abi.call({
      chain: 'arbitrum',
      target: arbitrum_gmd_usdc_pool,
      abi: uniV3Abi.slot0,
    })
    const sqrtPrice = Number(sqrtPriceX96) / 2 ** 96
    const rawPrice = sqrtPrice ** 2
    const { output: token0 } = await sdk.api.abi.call({ chain: 'arbitrum', target: arbitrum_gmd_usdc_pool, abi: 'address:token0' })
    const gmdIsToken0 = token0.toLowerCase() === arbitrum_GMD.toLowerCase()
    const decimalAdjustment = 10 ** (18 - 6)
    const gmdPrice = gmdIsToken0 ? rawPrice * decimalAdjustment : (1 / rawPrice) * decimalAdjustment
    api.addUSDValue(((+gmdBal + +esGmdBal) / 1e18) * gmdPrice)
  }
}
