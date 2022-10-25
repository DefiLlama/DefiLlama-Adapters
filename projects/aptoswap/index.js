const sdk = require('@defillama/sdk')
const { getResources, coreTokens } = require('../helper/aptos')
const { transformBalances } = require('../helper/portedTokens')
const { log } = require('../helper/utils')

const splitPoolToken = (typeString) => {
  const typeStringInner = typeString.slice(typeString.indexOf('<') + 1, typeString.lastIndexOf('>'));
  let typeStringSplitPos = 0;
  let typeStringBraceCounter = 0;
  for (let i = 0; i < typeStringInner.length; ++i) {
    const c = typeStringInner[i];
    if (c === '<') {
      typeStringBraceCounter += 1;
    }
    else if (c === ">") {
      typeStringBraceCounter -= 1;
    }
    else if (c === ',') {
      typeStringSplitPos = i;
      break;
    }
  }
  const token0 = typeStringInner.slice(0, typeStringSplitPos).trim();
  const token1 = typeStringInner.slice(typeStringSplitPos + 1).trim();
  return [token0, token1];
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  aptos: {
    tvl: async () => {
      const balances = {}
      const data = await getResources('0xa5d3ac4d429052674ed38adc62d010e52d7c24ca159194d17ddc196ddb7e480b')
      const pools = data.filter(i => i.type.includes('pool::Pool'))
      pools.forEach(({ type: typeString, data }) => {
        const {
          x: { value: reserve0 },
          y: { value: reserve1 },
        } = data

        // Split the ${adderss}::pool::Pool<token0, token1>
        const [token0, token1] = splitPoolToken(typeString);

        const isCoreAsset0 = coreTokens.includes(token0)
        const isCoreAsset1 = coreTokens.includes(token1)
        const nonNeglibleReserves = reserve0 !== '0' && reserve1 !== '0'
        if (isCoreAsset0 && isCoreAsset1) {
          sdk.util.sumSingleBalance(balances, token0, reserve0)
          sdk.util.sumSingleBalance(balances, token1, reserve1)
        } else if (isCoreAsset0) {
          sdk.util.sumSingleBalance(balances, token0, reserve0)
          if (nonNeglibleReserves)
            sdk.util.sumSingleBalance(balances, token0, reserve0)
        } else if (isCoreAsset1) {
          sdk.util.sumSingleBalance(balances, token1, reserve1)
          if (nonNeglibleReserves)
            sdk.util.sumSingleBalance(balances, token1, reserve1)
        }
      })
      return transformBalances('aptos', balances)
    }
  }
}