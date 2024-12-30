const sdk = require('@defillama/sdk')

const ADDRESSES = require('../helper/coreAssets.json')

const abi = {
  "tvl": "function tvl() external view returns (uint256)"
}

const config = {
  manta: {
    fManta: "0x3008bEB3E883CC90f95344B875d8b0c6F224fDC0",
    sManta: "0x56c02b7388dfce36c4b53878890Cf450145E23cA"
  },
  aleo: {
    fAleo: "0x16077d3455DE4Aae822eF46390ef216166803347",
    sAleo: "0x6a8C66dEcb40FD2d1F1429AB12A125437c7988E9"
  },
  bnb: {
    fBNB: "0xcB8FbEBAA1994A535cC7A87f021C7De65F165B36"
  }
};

const tokenMapping = {
  manta: "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5",  // MANTA token address
  // aleo: ADDRESSES.ALEO.ALEO,    // ALEO token address
  bnb: ADDRESSES.bsc.WBNB       // BNB token address
};


const ALEO_PRICE = "0.956"

async function tvl(api) {
  const balances = {}
  let totalUsdTvl = 0
  
  for (const [chain, contracts] of Object.entries(config)) {
    const tokenAddress = tokenMapping[chain]
    let chainTvl = 0
    
    for (const [_, contractAddress] of Object.entries(contracts)) {
      const tvlAmount = await api.call({ 
        abi: abi.tvl,
        target: contractAddress
      })
      
      if (chain === 'aleo') {
        // use fixed price for ALEO
        chainTvl += (Number(tvlAmount) / 1e18) * ALEO_PRICE
      } else {
        // add tvl to balances
        api.add(tokenAddress, tvlAmount)
      }
    }
    
    if (chain === 'aleo') {
      totalUsdTvl += chainTvl
    }
  }
  
  return {
    ...balances,
    tether: totalUsdTvl  // add aleo pool tvl
  }
}

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology: "Calculates TVL of staked tokens, using the price of ALEO from Coinmarketcap",
}