const { sumTokens2 } = require("../helper/unwrapLPs")

const vaultAddresses = {
  CantoNoteLP: '0x89Dc2cc570E40E9cCE0364ecf0e14347215156fF',
  CantoAtomLP: '0x1442261A3ed64620B10c3c015a4C7553422137EA',
  NoteUSDTLP: '0xd6Cb001d4aB7939Ab766ea577D7978FcE1212529',
  NoteUSDCLP: '0xD6F6c81C5885a143227D24E4B3555AdbD696e1a2',
  CantoETHLP: '0xd535845D5aA2b6B81aa8f5AA048358afbC93a33C',

  vCantoFlow: '0xa492DFa8D448f4B0d998a416A30FC4678d057304',
  vNoteFlow: '0x4DF1ACfBadf2ebA8BE500205dF435f8445359aB3',
  vNoteCanto: '0x64A982A8A750CC3D9a83b8276423adB1a8d07251',
  vCantoAtom: '0x671aDb6af35Bc8508d67DBE8683a7eb8612b7aB9',
  vCantoETH: '0xDE08DC04e2DeC9f1d9E3E79Ee609184CF101169b',
  vCINUCanto: '0x8de89E06EF165Df31AF819873AB6FB62540155bd',
  vCBONKCanto: '0x2ec3f5b72A2eb8765386A68c11BefBd9701583E4',
  vETHFlow: '0xfa91ff70E06ceE35e85eBAC7223E1A92ad51cEEC',
  vCantoSomm: '0x6D5FD9991c85bF1256D76F4b254558d2851058ef',
  vCantoGrav: '0xB3A7c46283AC1538a6dcd2a9eBa7691181a2fC4e',
  vFlowUSDT: '0xE1b05d4f2A61c32B3deAD4fc6BA0f07d595a4f8B',
}

async function tvl(api) {
  const vaults = Object.values(vaultAddresses)
  const tokens = await api.multiCall({  abi: abis.want, calls: vaults})
  const bals = await api.multiCall({  abi: abis.balance, calls:vaults })
  api.addTokens(tokens, bals)
  return sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  canto: {
    tvl,
  },
};

const abis ={
  balance: "function balance() returns (uint256)",
  want: "address:want",
}