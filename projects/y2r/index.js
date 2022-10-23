const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { BigNumber } = require('bignumber.js')

const lps = ['CantoNoteLP', 'CantoAtomLP', 'NoteUSDTLP', 'NoteUSDCLP', 'CantoETHLP']
const lpAddresses = {
  CantoNoteLP: '0x1D20635535307208919f0b67c3B2065965A85aA9',
  CantoAtomLP: '0x30838619C55B787BafC3A4cD9aEa851C1cfB7b19',
  NoteUSDTLP: '0x35DB1f3a6A6F07f82C76fCC415dB6cFB1a7df833',
  NoteUSDCLP: '0x9571997a66D63958e1B3De9647C22bD6b9e7228c',
  CantoETHLP: '0x216400ba362d8FCE640085755e47075109718C8B',
}
const clpAddresses = {
  CantoNoteLP: '0x3C96dCfd875253A37acB3D2B102b6f328349b16B',
  CantoAtomLP: '0xC0D6574b2fe71eED8Cd305df0DA2323237322557',
  NoteUSDTLP: '0xf0cd6b5cE8A01D1B81F1d8B76643866c5816b49F',
  NoteUSDCLP: '0xD6a97e43FC885A83E97d599796458A331E580800',
  CantoETHLP: '0xb49A395B39A0b410675406bEE7bD06330CB503E3',
}
const vaultAddresses = {
  CantoNoteLP: '0xe9F857be65E73c0bc86BCbb35cA8aFAB4d70e178',
  CantoAtomLP: '0x698880B18B237BD042440BCB23e0134a38d3295b',
  NoteUSDTLP: '0x72987Fa687496F3797d944BFCfddAdBe306581AE',
  NoteUSDCLP: '0x541ebf0a46c3138098bcebe1698dA3FDb6BA8f8A',
  CantoETHLP: '0x3f1CbcF0495928b0f347b50ceCFd8641BBc44A7f',
}
const chain = 'canto'
const balances = {};
const lpPositions = [];

async function transformCantoAddress() {
  const mapping = {
    "0x80b5a32e4f032b2a058b4f29ec95eefeeb87adcd": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0xd567b3d7b8fe3c79a1ad8da978812cfc4fa05e75": "0xdAC17F958D2ee523a2206206994597C13D831ec7",  // USDT
    "0x5fd55a1b9fc24967c4db09c513c3ba0dfa7ff687": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",  // ETH
    "0xeceeefcee421d8062ef8d6b4d814efe4dc898265": "cosmos",
    "0x4e71a2e537b7f9d9413d3991d37958c0b5e1e503": "note",
    "0x826551890dc65655a0aceca109ab11abdbd7a07b": "canto",
  }
  return addr => {
    if (mapping[addr]) return mapping[addr];
    return `canto:${addr}`;
  };
}

async function balance(chainBlocks) {
  const transformAddress = await transformCantoAddress();

  for (var lp of lps) {
    lpPositions.push({
      token: lpAddresses[lp],
      balance: (
        await sdk.api.erc20.balanceOf({
          target: clpAddresses[lp],
          owner: vaultAddresses[lp],
          block: chainBlocks[chain],
          chain: chain
        })
      ).output,
    });
  }
  console.log(lpPositions)
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chain],
    chain,
    transformAddress
  );

  balances['cosmos'] = new BigNumber(balances['cosmos']) / 1e6
  balances['canto'] = new BigNumber(balances['canto']) / 1e18
  balances['note'] = new BigNumber(balances['note']) / 1e18

  console.log(balances)
  return balances
}

module.exports = {
  canto: {
    tvl: balance,
  },
};
