const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  solanaMintedOrBridged,
  terraSupply,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x4fabb145d64652a948d72533023f6e7a623c7c53"],
    bridgedFromBSC: ["0x7B4B0B9b024109D182dCF3831222fbdA81369423"], // wormhole
  },
  bsc: {
    bridgeOnETH: ["0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503"],
    bridgedFromETH: [
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      "0x035de3679E692C471072d1A09bEb9298fBB2BD31", // wormhole
    ],
  },
  avax: {
    bridgeOnETH: ["0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0"],
    bridgedFromETH: ["0x19860ccb0a68fd4213ab9d8266f7bbf05a8dde98"],
    bridgedFromBSC: ["0xA41a6c7E25DdD361343e8Cb8cFa579bbE5eEdb7a"], // wormhole
  },
  solana: {
    bridgeOnETH: ["0xf92cd566ea4864356c5491c177a430c222d7e678"],
    bridgedFromETH: [
      "33fsBLA8djQm82RpHmE3SuVrPGtZBWNYExsEUeKX1HXX", // wormhole
      "AJ1W9A9N9dEMdVyoDiam2rV44gnBm2csrPDP7xqcapgX", // wormhole
      "6nuaX3ogrr2CaoAPjtaKHAoBNWok32BMcRozuf32s2QF", // allbridge
    ],
    bridgedFromBSC: ["5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2"], // wormhole
  },
  harmony: {
    bridgeOnETH: ["0xfd53b1b4af84d59b20bf2c20ca89a6beeaa2c628"],
    bridgedFromETH: ["0xe176ebe47d621b984a73036b9da5d834411ef734"],
  },
  iotex: {
    bridgedFromETH: ["0x84abcb2832be606341a50128aeb1db43aa017449"], // don't know if source is eth or bsc
  },
  okexchain: {
    bridgedFromBSC: ["0x332730a4f6e03d9c55829435f10360e13cfa41ff"], // multichain
  },
  moonriver: {
    bridgedFromBSC: [
      "0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818", // multichain
      "0xaBD347F625194D8e56F8e8b5E8562F34B6Df3469", // passport.meter
    ],
  },
  polygon: {
    bridgedFromBSC: [
      "0x9fb83c0635de2e815fd1c21b3a292277540c2e8d", // multichain
      "0xA8D394fE7380b8cE6145d5f85E6aC22d4E91ACDe", // wormhole
    ],
  },
  fuse: {
    bridgedFromBSC: ["0x6a5f6a8121592becd6747a38d67451b310f7f156"],
  },
  meter: {
    bridgedFromBSC: ["0x24aa189dfaa76c671c279262f94434770f557c35"], // meter.passport
  },
  moonbeam: {
    bridgedFromBSC: [
      "0xa649325aa7c5093d12d6f98eb4378deae68ce23f", // multichain
      "0x7B37d0787A3424A0810E02b24743a45eBd5530B2", // meter.passport
    ],
  },
  milkomeda: {
    bridgedFromBSC: [
      "0x218c3c3d49d0e7b37aff0d8bb079de36ae61a4c0", // multichain
      "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E", // celer
    ],
  },
  elastos: {
    bridgedFromBSC: ["0x9f1d0ed4e041c503bd487e5dc9fc935ab57f9a57"], // glide/shadowtokens
  },
  aurora: {
    bridgedFromBSC: [
      "0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818", // multichain
      "0x3b40D173b5802733108E047CF538Be178646b2e4", // celer
      "0x5C92A4A7f59A9484AFD79DbE251AD2380E589783", // allbridge
    ],
  },
  terra: {
    bridgedFromBSC: ["terra1skjr69exm6v8zellgjpaa2emhwutrk5a6dz7dd"], // wormhole
  },
  oasis: {
    bridgedFromBSC: ["0xf6568FD76f9fcD1f60f73b730F142853c5eF627E"], // wormhole
  },
  shiden: {
    bridgedFromBSC: ["0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a"], // multichain, not 100% sure it's from BSC
  },
  astar: {
    bridgedFromBSC: ["0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E"], // celer
  },
  evmos: {
    bridgedFromBSC: ["0x516e6D96896Aea92cE5e78B0348FD997F13802ad"], // celer
  },
  syscoin: {
    bridgedFromBSC: ["0x375488F097176507e39B9653b88FDc52cDE736Bf"], // multichain
  },
  boba: {
    bridgedFromBSC: ["0x461d52769884ca6235B685EF2040F47d30C94EB5"], // multichain
  },
  metis: {
    bridgedFromBSC: ["0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c"], // multichain
  },
  fantom: {
    bridgedFromBSC: ["0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50"], // address is related to multichain, but name of token is different?
  },
  kcc: {
    bridgedFromBSC: ["0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d"], // multichain
  },
  rsk: {
    bridgedFromBSC: ["0x2bf9b864cdc97b08b6d79ad4663e71b8ab65c45c"], // multichain
  },
  theta: {
    bridgedFromBSC: ["0x7B37d0787A3424A0810E02b24743a45eBd5530B2"], // multichain
  },
};

/*
Celo: don't know which addresses to use, can't find any info.

Cronos: 0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8, not sure whether to add because there is no bridge.

Telos: can't find addresses.

Sora: can't find API query to use.

Theta: address on coingecko seems wrong.

Flow: A.231cc0dbbcffc4b7.ceBUSD, have not added yet.
*/

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** decimals);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
    bsc: bridgedSupply("ethereum", 18, chainContracts.ethereum.bridgedFromBSC),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromETH),
    bsc: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromBSC),
  },
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "harmony",
      18,
      chainContracts.harmony.bridgedFromETH
    ),
  },
  iotex: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("iotex", 18, chainContracts.iotex.bridgedFromETH),
  },
  okexchain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply(
      "okexchain",
      18,
      chainContracts.okexchain.bridgedFromBSC
    ),
  },
  moonriver: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply(
      "moonriver",
      18,
      chainContracts.moonriver.bridgedFromBSC
    ),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
    bsc: solanaMintedOrBridged(chainContracts.solana.bridgedFromBSC),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("polygon", 18, chainContracts.polygon.bridgedFromBSC),
  },
  fuse: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("fuse", 18, chainContracts.fuse.bridgedFromBSC),
  },
  meter: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("meter", 18, chainContracts.meter.bridgedFromBSC),
  },
  moonbeam: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("moonbeam", 18, chainContracts.moonbeam.bridgedFromBSC),
  },
  milkomeda: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply(
      "milkomeda",
      18,
      chainContracts.milkomeda.bridgedFromBSC
    ),
  },
  elastos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("elastos", 18, chainContracts.elastos.bridgedFromBSC),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromBSC),
  },
  oasis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("oasis", 18, chainContracts.oasis.bridgedFromBSC),
  },
  terra: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: terraSupply(chainContracts.terra.bridgedFromBSC, 8),
  },
  shiden: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("shiden", 18, chainContracts.shiden.bridgedFromBSC),
  },
  astar: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("astar", 18, chainContracts.astar.bridgedFromBSC),
  },
  evmos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("evmos", 18, chainContracts.evmos.bridgedFromBSC),
  },
  syscoin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("syscoin", 18, chainContracts.syscoin.bridgedFromBSC),
  },
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromBSC),
  },
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("metis", 18, chainContracts.metis.bridgedFromBSC),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromBSC),
  },
  kcc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("kcc", 18, chainContracts.kcc.bridgedFromBSC),
  },
  rsk: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("rsk", 18, chainContracts.rsk.bridgedFromBSC),
  },
  theta: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bsc: bridgedSupply("theta", 18, chainContracts.theta.bridgedFromBSC),
  },
};

export default adapter;
