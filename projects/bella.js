
const sdk = require('@defillama/sdk')
const { sumTokens } = require('./helper/unwrapLPs')
const bVaultAbi = require('./config/bella/abis/bVault')
const ADDRESSES = require('./helper/coreAssets.json');
const { getPoolLiquidityAmount } = require('./config/bella/izi');
const iziABI = require('./config/bella/abis/izi');

const bVaults = {
  bUsdt: { address: '0x2c23276107b45E64c8c59482f4a24f4f2E568ea6', },
  bUsdc: { address: '0x8016907D54eD8BCf5da100c4D0EB434C0185dC0E', },
  bArpa: { address: '0x750d30A8259E63eD72a075f5b6630f08ce7996d0', },
  bWbtc: { address: '0x3fb6b07d77dace1BA6B5f6Ab1d8668643d15a2CC', },
  bHbtc: { address: '0x8D9A39706d3B66446a298f1ae735730257Ec6108', },
  // bBusd: { address: '0x378388aa69f3032FA46150221210C7FA70A35153', },  // according to the team this is deprecated
}

const uniswapV2Pools = {
  belUsdt: { address: '0xf0d1109e723cb06e400e2e57d0b6c7c32bedf61a', owner: '0x6731a6a2586a0d555dcff7eb4d8fb7444bdfde2a' },
  belEth: { address: '0x9e98deac1a416c9ce3c892bd8eef586f1291ca35', owner: '0x994be2994471d5ef93c600cf78c2752c5e96f5a7' },
  arpaUsdt: { address: '0x9F624b25991b99D7b14d6740A9D581DD77980808', owner: '0xc935285b0d88069305431dace0c3c01d7e793d84' },
}

async function tvl(ts, block) {
  const tokenCalls = Object.values(bVaults).map(a => ({ target: a.address }))

  const { output: tokenResponse } = await sdk.api.abi.multiCall({
    block, calls: tokenCalls, abi: bVaultAbi.token
  })

  const { output: underlyingBalances } = await sdk.api.abi.multiCall({
    block, calls: tokenCalls, abi: bVaultAbi.underlyingBalance
  })

  const balances = {}
  tokenResponse.forEach(({ input, output }, i) => {
    sdk.util.sumSingleBalance(balances, output, underlyingBalances[i].output || 0)
  })
  return balances
}

async function pool2(ts, block) {
  const toa = []
  Object.values(uniswapV2Pools).forEach(({ address, owner }) => toa.push([address, owner]))
  return sumTokens({}, toa, block,)
}

module.exports = {
  ethereum: {
    tvl,
    pool2,
  },
  manta: {
    pool2: async (api) => {
      const STONE = '0xEc901DA9c68E90798BbBb74c11406A32A70652C3'
      const WUSDM = '0xbdAd407F77f44F7Da6684B416b1951ECa461FB07'
      const IZI = '0x91647632245cabf3d66121f86c387ae0ad295f9a'
      const miningContract = '0x2C9bFcA337bAc7cBdA3B80D1b2d10ed6482D7C0f'
      const MiningABI = iziABI.mantaMiningABI;
      const {totalTokenX_, totalTokenY_, totalNIZI_} = await api.call({
        abi: MiningABI, 
        target: miningContract,
        chain: 'manta',
      });

      return {
        [`manta:${STONE}`]: totalTokenY_,
        [`manta:${WUSDM}`]: totalTokenX_,
        [`manta:${IZI}`]: totalNIZI_,
      }
    }
  },
  mantle: {
    pool2: async (api) => {
      const swapPool = '0xC865dd3421a6DD706688955fe727C802A98c1df9';
      const miningPool = '0xBF2b951Ae6af066A03Dbfa52b1329704D923980c';

      const { rewardUpperTick_, rewardLowerTick_, totalVLiquidity_ } =
        await api.call({
          abi: iziABI.mantleMiningABI,
          target: miningPool,
          chain: 'mantle',
        });

      const totalNizi = await api.call({
        abi: iziABI.mantleTotalNiZiABI,
        target: miningPool,
        chain: 'mantle',
      });

      const { liquidity, liquidityX, currentPoint } = await api.call({
        abi: iziABI.mantlePoolABI,
        target: swapPool,
        chain: 'mantle',
      });

      const { amountX, amountY } = getPoolLiquidityAmount(
        {
          rewardUpperTick_,
          rewardLowerTick_,
          totalVLiquidity_,
        },
        currentPoint,
        liquidity,
        liquidityX
      );

      return {
        [`ethereum:${ADDRESSES.ethereum.USDC}`]: amountX,
        [`ethereum:${ADDRESSES.ethereum.USDT}`]: amountY,
        [`bsc:${ADDRESSES.bsc.iZi}`]: totalNizi,
      };
    },
  },
  era: {
    pool2: async (api) => {
      const pool2s = [
        '0x9FB6Ca27D20E569E5c8FeC359C9d33D468d2803C',
        '0x3bd7a1D8c760d8be1bC57A3205cbFfBaDFB74D94'
      ]
      const infoABI = "function getMiningContractInfo() external view returns (address tokenX, address tokenY, uint24 fee_, address iziTokenAddr, uint256 lastTouchTime_, uint256 totalVLiquidity_, uint256 bal0, uint256 bal1, uint256 balIzi, uint256 startTime_, uint256 endTime_)"

      const data = await api.multiCall({ abi: infoABI, calls: pool2s })
      const transform = i => i.toLowerCase() === '0xb83cfb285fc8d936e8647fa9b1cc641dbaae92d9' ? 'ethereum:0xa91ac63d040deb1b7a5e4d4134ad23eb0ba07e14': 'era:'+i  
      for (const { tokenX, tokenY, iziTokenAddr, bal0, bal1, balIzi } of data) {
        api.add(transform(tokenX), bal0, { skipChain: true})
        api.add(transform(tokenY), bal1, { skipChain: true})
        api.add(iziTokenAddr, balIzi)
      }
    },
  },
}

