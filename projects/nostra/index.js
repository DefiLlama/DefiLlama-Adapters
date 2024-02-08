const { multiCall } = require("../helper/chain/starknet");
const { assetTokenAbi } = require("./abi");

const supplyTokens = [
  // WBTC
  "0x0735d0f09a4e8bf8a17005fa35061b5957dcaa56889fc75df9e94530ff6991ea",
  "0x05b7d301fa769274f20e89222169c0fad4d846c366440afc160aafadd6f88f0c",
  "0x073132577e25b06937c64787089600886ede6202d085e6340242a5a32902e23e",
  "0x036b68238f3a90639d062669fdec08c4d0bdd09826b1b6d24ef49de6d8141eaa",
  // ETH
  "0x01fecadfe7cda2487c66291f2970a629be8eecdcb006ba4e71d1428c2b7605c7",
  "0x057146f6409deb4c9fa12866915dd952aa07c1eb2752e451d7f3b042086bdeb8",
  "0x07170f54dd61ae85377f75131359e3f4a12677589bb7ec5d61f362915a5c0982",
  "0x044debfe17e4d9a5a1e226dabaf286e72c9cc36abbe71c5b847e669da4503893",
  // USDC
  "0x002fc2d4b41cc1f03d185e6681cbd40cced61915d4891517a042658d61cba3b1",
  "0x05dcd26c25d9d8fd9fc860038dcb6e4d835e524eb8a85213a8cda5b7fff845f6",
  "0x06eda767a143da12f70947192cd13ee0ccc077829002412570a88cd6539c1d85",
  "0x05f296e1b9f4cf1ab452c218e72e02a8713cee98921dad2d3b5706235e128ee4",
  // DAI
  "0x022ccca3a16c9ef0df7d56cbdccd8c4a6f98356dfd11abc61a112483b242db90",
  "0x04f18ffc850cdfa223a530d7246d3c6fc12a5969e0aa5d4a88f470f5fe6c46e9",
  "0x02b5fd690bb9b126e3517f7abfb9db038e6a69a068303d06cf500c49c1388e20",
  "0x005c4676bcb21454659479b3cd0129884d914df9c9b922c1c649696d2e058d70",
  // USDT
  "0x0360f9786a6595137f84f2d6931aaec09ceec476a94a98dcad2bb092c6c06701",
  "0x0453c4c996f1047d9370f824d68145bd5e7ce12d00437140ad02181e1d11dc83",
  "0x06669cb476aa7e6a29c18b59b54f30b8bfcfbb8444f09e7bbb06c10895bf5d7b",
  "0x0514bd7ee8c97d4286bd481c54aa0793e43edbfb7e1ab9784c4b30469dcf9313",
];
const debtTokens = [
  "0x0491480f21299223b9ce770f23a2c383437f9fbf57abc2ac952e9af8cdb12c97",
  "0x00ba3037d968790ac486f70acaa9a1cab10cf5843bb85c986624b4d0e5a82e74",
  "0x063d69ae657bd2f40337c39bf35a870ac27ddf91e6623c2f52529db4c1619a51",
  "0x066037c083c33330a8460a65e4748ceec275bbf5f28aa71b686cbc0010e12597",
  "0x024e9b0d6bc79e111e6872bb1ada2a874c25712cf08dfc5bcf0de008a7cca55f",
];

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

async function tvl(_, _1, _2, { api }) {
  const supplied = await multiCall({
    calls: supplyTokens,
    abi: assetTokenAbi.totalSupply,
  });
  const borrowed = await multiCall({
    calls: debtTokens,
    abi: assetTokenAbi.totalSupply,
  });
  const underlyings = await multiCall({
    calls: debtTokens,
    abi: assetTokenAbi.underlyingAsset,
  });
  const data = [...chunks(supplied, 4)].map((chunk, i) => {
    const totalSupply = chunk.reduce((acc, cur) => acc + cur, 0);
    return totalSupply - borrowed[i];
  });
  api.addTokens(underlyings, data);
}

async function borrowed(_, _1, _2, { api }) {
  const borrowed = await multiCall({
    calls: debtTokens,
    abi: assetTokenAbi.totalSupply,
  });
  const underlyings = await multiCall({
    calls: debtTokens,
    abi: assetTokenAbi.underlyingAsset,
  });
  api.addTokens(underlyings, borrowed);
}

module.exports = {
  methodology:
    "The TVL is calculated as a difference between supplied and borrowed assets.",
  starknet: {
    tvl,
    borrowed,
  },
  hallmarks: [
    [1697634000, "Nostra Money Market launch"]
  ]
};
