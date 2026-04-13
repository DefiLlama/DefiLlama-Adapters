const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require('bignumber.js');
const { ethers } = require('ethers')
async function tvl(api) {
  const protocols = [
    '0xc0fA386aE92f18A783476d09121291A1972C30Dc',
    '0x4737c3BAB13a1Ad94ede8B46Bc6C22fb8bBE9c81',
    '0x9F0956c33f45141a7D8D5751038ae0A71C562f87',
    '0xd75Dc0496826FF0C13cE6D6aA5Bf8D64126E4fF1'
  ]

  const tokensAndOwners = []

  for (const zooProtocol of protocols) {
    const assets = await api.call({ abi: 'address[]:assetTokens', target: zooProtocol })

    const vaults = (await api.multiCall({ abi: 'function getVaultAddresses(address) view returns (address[])', calls: assets, target: zooProtocol })).flat()
    const assetBals = await api.multiCall({ abi: 'uint256:assetBalance', calls: vaults, permitFailure: true })
    api.add(assets, assetBals.map(i => i ?? 0))

    // Add vault balances
    vaults.forEach((vault, i) => tokensAndOwners.push([assets[i], vault]))

    // Add redeem pool balances
    const epochInfoAbi = 'function epochInfoById(uint256 epochId) public view returns (uint256 epochId, uint256 startTime, uint256 duration, address redeemPool, address stakingBribesPool, address adhocBribesPool)'
    const epochInfos = await api.fetchList({ lengthAbi: 'epochIdCount', itemAbi: epochInfoAbi, targets: vaults, startFromOne: true, groupedByInput: true })

    epochInfos.forEach((infos, i) => {
      const asset = assets[i]
      infos.forEach(({ redeemPool }) => {
        tokensAndOwners.push([asset, redeemPool])
      })
    })
  }

  return api.sumTokens({ tokensAndOwners })
}


async function quoteOutByUni(api, universion, quoter, amountIn, path) {
  if(![2,3].includes(universion)) throw new Error('unsupported uniswap version')
  // univ3
  if(universion === 3){
    return api.call({
      target: quoter,
      abi: 'function quoteExactInput(bytes path, uint256 amountIn) view returns (uint256 amountOut)',
      params: [path, amountIn]
    })
  }
  // univ2
  return api.call({
    target: quoter,
    abi: 'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    params: [amountIn, path]
  }).then((amounts) => amounts[amounts.length - 1])
}

const lntlvts = {
  arbitrum: [
  {
      // Aethir LntVault
      asset: '0xc87B37a581ec3257B734886d9d3a581F5A9d056c',
      vthook: '0xbf4b4A83708474528A93C123F817e7f2A0637a88',
      nft: '0xc227e25544edd261a9066932c71a25f4504972f1', 
      nftVault: '0xf8dfaa0967c812a43d02059f2b14786dceb84e8b'
  },
  {
    // Aethir UniV3 Pool
    uniV3: true,
    // vATH: ATH  pool
    pool: '0xC30a053e4689A1080EB7DcbF09B3Bf7b628309DD',
  }
 ],
  bsc: [
    {
      // Filecoin LvtVault
      asset: '0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153',
      vt: '0x24ef95c39dfaa8f9a5adf58edf76c5b22c34ef46',
      vthook: '0xed202a7050ee856ba9f0d3cd5eabcab6b8a23a88',
      quoter: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',// univ3 quotev2
      fee: 500,
    }
  ],
  base: [
    {
      // Reppo LvtVault
      asset: '0xFf8104251E7761163faC3211eF5583FB3F8583d6',
      vt: '0x24ef95c39dfaa8f9a5adf58edf76c5b22c34ef46',
      vthook: '0x2b72494fd4f092569b87e1a10f92268384f07a88',
      quoter: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24' //uni v2router
    }
  ],
  sei: [
    {
      // Sei LvtVault
      asset: '0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7',
      vt: '0x92838ccdb9dceabc8e77415d73ecb06f8050cc5f',
      vthook: '0x3362cb23043cb5e7c52711c5763c69fd513a3a88',
    }
  ],
  sty: [
    {
      // Verio LvtVault
      asset: ADDRESSES.sty.WIP,
      vt: '0x92838ccdb9dceabc8e77415d73ecb06f8050cc5f',
      vthook: '0xee5aeecd6c9409424f88163aff415efcb9027a88',
      quoter: '0x1434Ae03CfA29d314da73fC18013CCd04f100af6',
      fee: 500, 
    }
  ]
}

async function tvlLntLvt(api) {
  const lntconfigs = lntlvts[api.chain] || []
  for (const vc of lntconfigs) {
    if (vc.uniV3) {
      const [token0, token1, slot0, liquidity] = await api.batchCall([
        { abi: 'address:token0', target: vc.pool },
        { abi: 'address:token1', target: vc.pool },
        { abi: 'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)', target: vc.pool },
        { abi: 'function liquidity() view returns (uint128)', target: vc.pool },
      ])
      // reserves0 = liquidity * (2^96) / sqrtPriceX96
      // reserves1 = liquidity * sqrtPriceX96 / (2^96)
      const sqrtPriceX96 = slot0[0]
      const Q96 = BigNumber(2).pow(96)
      const L = BigNumber(liquidity)
      const sqrtP = BigNumber(sqrtPriceX96)
      // token0 = L * Q96 / sqrtP
      // token1 = L * sqrtP / Q96
      const reserve0 = L.times(Q96).div(sqrtP).toFixed(0)
      const reserve1 = L.times(sqrtP).div(Q96).toFixed(0)
      api.add(token0, reserve0)
      api.add(token1, reserve1)
    } else  {
      if(vc.nft){
        // lnt
        const [isToken0VT, reserve0, reserve1, nftBalance] = await api.batchCall([
          { abi: 'bool:isToken0VT', target: vc.vthook },
          { abi: 'uint256:reserve0', target: vc.vthook },
          { abi: 'uint256:reserve1', target: vc.vthook },
          { abi: 'erc20:balanceOf', target: vc.nft, params: [vc.nftVault] }
        ])
        api.add(vc.asset, isToken0VT ? reserve1 : reserve0)
        api.add(vc.nft, nftBalance)

      } else {
        // lvt
        const [decimals,vtTotalSupply] = await api.batchCall([
          { abi: 'erc20:decimals', target: vc.vt },
          { abi: 'erc20:totalSupply', target: vc.vt }
        ])
        const amountVT = BigNumber(10).pow(decimals/2).toString()
        const amountOutAsset = await Promise.resolve(0)
          .then(() => {
            if(!vc.quoter) return 0
            if(vc.fee){
              return quoteOutByUni(api, 3, vc.quoter, amountVT,  ethers.solidityPacked(['address','uint24','address'],[vc.vt, vc.fee, vc.asset]))
            }
            return quoteOutByUni(api, 2, vc.quoter, amountVT, [vc.vt, vc.asset])
          })
          .catch(() => 0) // in case quoter call fails, we don't want to break the whole TVL calculation
          .then((amountOut) => {
            // console.log(`quoteOut for ${vc.asset} via ${vc.quoter}:`, amountOut)
            if(amountOut === 0) {
              // fallback use vthook
              return api.call({
                abi: 'function getAmountOutVTforT(uint256) view returns (uint256)', 
                target: vc.vthook,
                params: [amountVT] 
              })
            }
            return amountOut
          })
        const totalAsset = BigNumber(amountOutAsset).times(vtTotalSupply).div(amountVT).toFixed(0)
        api.add(vc.asset, totalAsset)
      }
    } 
  }
}

module.exports = {
  doublecounted: true,
  berachain: { tvl },
  arbitrum: { tvl: tvlLntLvt },
  bsc: { tvl: tvlLntLvt },
  base: { tvl: tvlLntLvt },
  sei: { tvl: tvlLntLvt },
  sty: { tvl: tvlLntLvt },
}