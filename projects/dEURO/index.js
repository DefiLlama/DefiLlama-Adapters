const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs2 } = require('../helper/cache/getLogs')

const MAINNET = {
  WFPS: "0x5052D3Cc819f53116641e89b96Ff4cD1EE80B182",
  FPS: "0x1bA26788dfDe592fec8bcB0Eaff472a42BE341B2",
  ZCHF: "0xB58E61C3098d85632Df34EecfB899A1Ed80921cB",
  DEPS: "0x103747924E74708139a9400e4Ab4BEA79FFFA380",
  nDEPS: "0xc71104001A3CCDA1BEf1177d765831Bd1bfE8eE6",
};

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: '0x8B3c41c649B9c7085C171CbB82337889b3604618',
    fromBlock: 22088283,
    eventAbi: 'event PositionOpened (address indexed owner, address indexed position, address original, address collateral)',
    onlyArgs: true,
  });

  const tokensAndOwners = logs.map(log => [log.collateral.toLowerCase(), log.position]);

  await sumTokens2({ api, tokensAndOwners });

  // FPS has no CoinGecko price
  const price = await api.call({ abi: 'uint256:price', target: MAINNET.FPS })
  const wFPSbalance = api.getBalances()['ethereum:' + MAINNET.WFPS.toLowerCase()] || 0;
  api.removeTokenBalance(MAINNET.WFPS.toLowerCase());
  api.add(MAINNET.ZCHF, wFPSbalance * price / 1e18);

  // DEPS has no CoinGecko price
  const depsBalance = api.getBalances()['ethereum:' + MAINNET.DEPS.toLowerCase()] || 0;
  api.removeTokenBalance(MAINNET.DEPS.toLowerCase());
  api.add(MAINNET.nDEPS, depsBalance);
}

module.exports = {
  methodology: "TVL consists of collateral tokens in the positions and source stablecoins in the bridge contracts",
  ethereum: { tvl },
  start: '2025-03-20'
};