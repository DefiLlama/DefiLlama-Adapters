const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs2 } = require('../helper/cache/getLogs')

const MAINNET = {
  WFPS: "0x5052D3Cc819f53116641e89b96Ff4cD1EE80B182",
  FPS: "0x1bA26788dfDe592fec8bcB0Eaff472a42BE341B2",
  ZCHF: "0xB58E61C3098d85632Df34EecfB899A1Ed80921cB",
  DEPS: "0x103747924E74708139a9400e4Ab4BEA79FFFA380",
  nDEPS: "0xc71104001A3CCDA1BEf1177d765831Bd1bfE8eE6",
};

const MINTING_HUBS = [
  '0x8B3c41c649B9c7085C171CbB82337889b3604618',
  '0x66AcC54a0C64255137b8993CB4972B0901684f7B',
];

const BRIDGES = [
  ['0xC581b735A1688071A1746c968e0798D642EDE491', '0x2353D16869F717BFCD22DaBc0ADbf4Dca62C609f', 22088283],
  ['0xdb25f211ab05b1c97d595516f45794528a807ad8', '0x73f38ca06b27eaefb1612d062d885f58924f5897', 23836394],
  ['0x6ba75d640bebfe5da1197bb5a2aff3327789b5d3', '0x76d8f514554a4a8e5d6103875f2dd7a67543692b', 23836578],
  ['0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c', '0xB4fF7412f08C22d7381885e8BdA9EE9825092fd1', 23404702],
  ['0x50753CfAf86c094925Bf976f218D043f8791e408', '0x20B0a153fF16c7B1e962FD3D3352A00cf019f1a7', 22327569],
  ['0x888883b5F5D21fb10Dfeb70e8f9722B9FB0E5E51', '0x3EF3d03EFCc1338d6210946f8cF5Fb1a8b630341', 22327501],
  ['0x9d1A7A3191102e9F900Faa10540837ba84dCBAE7', '0xb66A40934a996373fA7602de9820C6bf3e8c9afE', 22327631],
  ['0x3231Cb76718CDeF2155FC47b5286d82e6eDA273f', '0x4dfd460d54854087af195906a2f260aa483a13b1', 23836465],
  ['0x1a7e4e63778b4f12a199c062f3efdd288afcbce8', '0x05620F4bB92246b4e067EBC0B6f5c7FF6B771702', 22939705],
];

async function tvl(api) {
  const block = await api.getBlock();
  const logs = await Promise.all(MINTING_HUBS.map(target => getLogs2({
    api,
    target,
    fromBlock: 22088283,
    eventAbi: 'event PositionOpened (address indexed owner, address indexed position, address original, address collateral)',
    onlyArgs: true,
  })));

  const tokensAndOwners = logs.flat().map(log => [log.collateral.toLowerCase(), log.position]);
  tokensAndOwners.push(...BRIDGES.filter(([, , fromBlock]) => block >= fromBlock).map(([token, owner]) => [token, owner]));

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
