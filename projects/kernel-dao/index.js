const ASSET_ACCUMULATOR = '0xeDC562F52aa31E74081359901D4f3a371Cf95371';

functionsToCall = [
    {
        abi: 'uint256:getTotalBNB',
        tokenKey: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
    },
    {
        abi: 'uint256:getTotalBTC',
        tokenKey: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTCB
    },
    {
        abi: 'uint256:getTotalETH',
        tokenKey: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', // WETH
    },
]

async function tvl(api) {
    for (const functionToCall of functionsToCall) {
        const collateralBalance = await api.call({
          abi: functionToCall.abi,
          target: ASSET_ACCUMULATOR,
          params: [],
        });
      
        api.add(functionToCall.tokenKey, collateralBalance);
    };
}

module.exports = {
  methodology: 'Calculates total TVL.',
  start: 1733817000,
  bsc: {
    tvl,
  }
};
