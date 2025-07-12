const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const stBTCTotalAssets = await api.call({
    target: ADDRESSES.btnx.stBTC,
    abi: 'function totalAssets() public view returns (uint256)'
  });
  api.add(ADDRESSES.btnx.stBTC, stBTCTotalAssets);

  const pBTCTotalSupply = await api.call({
    target: ADDRESSES.btnx.pBTC,
    abi: 'function totalSupply() public view returns (uint256)'
  });
  api.add(ADDRESSES.btnx.pBTC, pBTCTotalSupply);

  const tokenContracts = [
    ADDRESSES.btnx.USDC_E,
    ADDRESSES.btnx.WETH,
    ADDRESSES.btnx.PUSD,
    ADDRESSES.btnx.oUSDT
  ];

  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply', 
    calls: tokenContracts.map(token => ({
      target: token,
    }))
  });

  tokenContracts.forEach((token, i) => {
    api.add(token, supplies[i]);
  });
}

module.exports = {
  methodology: "TVL includes staked BTC with rewards, wrapped BTC supply, and balances of bridged assets (USDC.e, WETH, PUSD, oUSDT) in protocol contracts",
  btnx: {
    tvl
  }
}