const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  supplyInEthereumBridge,
  solanaMintedOrBridged,
  terraSupply,
  osmosisSupply,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { multiFunctionBalance } from "../helper/generalUtil";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x6B175474E89094C44Da98b954EedeAC495271d0F"],
  },
  solana: {
    bridgedFromETH: [
      "EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o", // wormhole
      "9w6LpS7RU1DKftiwH3NgShtXbkMM1ke9iNU4g3MBXSUs", // allbridge
    ],
    bridgedFromPolygon: ["4Fo67MYQpVhZj9R7jQTd63FPAnWbPpaafAUxsMGX2geP"], // wormhole
    bridgedFromAvax: ["EgQ3yNtVhdHz7g1ZhjfGbxhFKMPPaFkz8QHXM5RBZBgi"], // allbridge
    bridgedFromFantom: ["HjUhUzi6fVkY1BndaSc4Dcg2mCzvnqzXjVJtXsj78ver"], // allbridge
  },
  polygon: {
    bridgedFromETH: [
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      "0xddc9e2891fa11a4cc5c223145e8d14b44f3077c9", // axelar
    ],
  },
  bsc: {
    bridgedFromETH: [
      "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // 70M disparity, asked on forum about it: https://forum.makerdao.com/t/query-on-dai-bridged-from-ethereum-to-bsc/15121
      "0x3413a030EF81a3dD5a302F4B4D11d911e12ed337", // wormhole
    ],
  },
  optimism: {
    bridgedFromETH: ["0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"],
  },
  harmony: {
    bridgedFromETH: ["0xef977d2f931c1978db5f6747666fa1eacb0d0339"],
  },
  avax: {
    bridgedFromETH: [
      "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
      "0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a", // avalanche-ethereum bridge (old)
      "0xc5fa5669e326da8b2c35540257cd48811f40a36b", // axelar
    ],
  },
  arbitrum: {
    bridgedFromETH: ["0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"],
  },
  moonriver: {
    bridgedFromETH: ["0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844"], // multichain
  },
  aurora: {
    bridgedFromETH: ["0xe3520349f477a5f6eb06107066048508498a291b"],
  },
  fantom: {
    bridgedFromETH: [
      "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", // multichain
      "0xd5d5350f42cb484036a1c1af5f2df77eafadcaff", // axelar
    ],
  },
  moonbeam: {
    bridgedFromETH: [
      "0x765277eebeca2e31912c9946eae1021199b39c61", // multichain
      "0xc234A67a4F840E61adE794be47de455361b52413", // nomad
      "0x14df360966a1c4582d2b18edbdae432ea0a27575", // axelar
    ],
  },
  syscoin: {
    bridgedFromETH: ["0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73"], // multichain
  },
  milkomeda: {
    bridgedFromETH: [
      "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // multichain
      "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb", // celer
      "0x41eAFC40CD5Cb904157A10158F73fF2824dC1339", // nomad
    ],
  },
  astar: {
    bridgedFromETH: ["0x6De33698e9e9b787e09d3Bd7771ef63557E148bb"], // celer
  },
  oasis: {
    bridgedFromETH: ["0x5a4Ba16C2AeB295822A95280A7c7149E87769E6A"], // celer
  },
  evmos: {
    bridgedFromETH: [
      "0x940dAAbA3F713abFabD79CdD991466fe698CBe54", // celer
      "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA", // nomad
    ],
  },
  xdai: {
    bridgedFromETH: ["0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC"], // address related to OmniBridge, I don't get what this token is though
    bridgedFromBSC: ["0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC"],
  },
  terra: {
    bridgedFromETH: ["terra1zmclyfepfmqvfqflu8r3lv6f75trmg05z7xq95"], // wormhole
  },
  rsk: {
    bridgedFromETH: [
      "0x6b1a73d547f4009a26b8485b63d7015d248ad406",
      "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", //multichain
    ],
  },
  reinetwork: {
    bridgedFromETH: ["0x0ba85980B122353D77fBb494222a10a46E4FB1f6"], // celer
  },
  loopring: {
    bridgeOnETH: ["0x674bdf20A0F284D710BC40872100128e2d66Bd3f"],
  },
  zksync: {
    bridgeOnETH: ["0xaBEA9132b05A70803a4E85094fD0e1800777fBEF"],
  },
  aztec: {
    bridgeOnETH: ["0x737901bea3eeb88459df9ef1BE8fF3Ae1B42A2ba"],
  },
  velas: {
    bridgedFromETH: ["0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D"], // multichain
  },
  kcc: {
    bridgedFromETH: ["0xc9baa8cfdde8e328787e29b4b078abf2dadc2055"], // multichain
  },
  shiden: {
    bridgedFromETH: ["0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73"], // multichain
  },
  fusion: {
    bridgedFromETH: [
      "0x1f858232892f9968d05bb5a69d1a02b14ea6fa57d97549481345838a13339889",
    ], // multichain?
  },
  boba: {
    bridgedFromETH: ["0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35"],
  },
  conflux: {
    bridgedFromETH: [
      "0x87929dda85a959f52cab6083a2fba1b9973f15e0", // don't know
      "0x74eaE367d018A5F29be559752e4B67d01cc6b151", // celer
    ],
  },
};

/*
Sora: can't find API call that works 0x0001d8f1f93b103d8619d367dbecea3182e5546bea164355fe7decc8be301f63

Cronos: they have not provided any proof the circulating DAI is real DAI.

Possible multichain destinations that were missed missed: etc (can't find address), conflux,
fusion (has 0 supply?), oasis (can't find address), rei (can't find address)

Orbit: has no provider, no API.

Conflux: don't know how to get calls to work. 0x74eaE367d018A5F29be559752e4B67d01cc6b151 (celer),
0x87929dda85a959f52cab6083a2fba1b9973f15e0 (don't know source)

Evmos: can't find multichain contract, no liquidity on dexes.
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

async function gnosisMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://blockscout.com/xdai/mainnet/api?module=stats&action=coinsupply"
        )
    );
    const totalSupply = parseInt(res.data);
    sumSingleBalance(balances, "peggedUSD", totalSupply);
    return balances;
  };
}

async function reinetworkMinted(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://scan.rei.network/api?module=token&action=getToken&contractaddress=${address}`
        )
    );
    const totalSupply = parseInt(res.data.result.totalSupply) / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", totalSupply);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
    polygon: solanaMintedOrBridged(chainContracts.solana.bridgedFromPolygon),
    avalanche: solanaMintedOrBridged(chainContracts.solana.bridgedFromAvax),
    fantom: solanaMintedOrBridged(chainContracts.solana.bridgedFromFantom),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH
    ),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
  optimism: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromETH
    ),
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
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromETH),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  moonriver: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "moonriver",
      18,
      chainContracts.moonriver.bridgedFromETH
    ),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromETH),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
  },
  moonbeam: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "moonbeam",
      18,
      chainContracts.moonbeam.bridgedFromETH
    ),
  },
  syscoin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "syscoin",
      18,
      chainContracts.syscoin.bridgedFromETH
    ),
  },
  milkomeda: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "milkomeda",
      18,
      chainContracts.milkomeda.bridgedFromETH
    ),
  },
  astar: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("astar", 18, chainContracts.astar.bridgedFromETH),
  },
  oasis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("oasis", 18, chainContracts.oasis.bridgedFromETH),
  },
  evmos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("evmos", 18, chainContracts.evmos.bridgedFromETH),
  },
  xdai: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: multiFunctionBalance(
      [
        gnosisMinted(),
        bridgedSupply("xdai", 18, chainContracts.xdai.bridgedFromETH),
      ],
      "peggedUSD"
    ),
    bsc: bridgedSupply("xdai", 18, chainContracts.xdai.bridgedFromBSC),
  },
  terra: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: terraSupply(chainContracts.terra.bridgedFromETH, 8),
  },
  rsk: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("rsk", 18, chainContracts.rsk.bridgedFromETH),
  },
  reinetwork: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: reinetworkMinted(chainContracts.reinetwork.bridgedFromETH[0], 18),
  },
  loopring: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.loopring.bridgeOnETH[0],
      18
    ),
  },
  zksync: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.zksync.bridgeOnETH[0],
      18
    ),
  },
  aztec: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.aztec.bridgeOnETH[0],
      18
    ),
  },
  velas: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("velas", 18, chainContracts.velas.bridgedFromETH),
  },
  kcc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("kcc", 18, chainContracts.kcc.bridgedFromETH),
  },
  shiden: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("shiden", 18, chainContracts.shiden.bridgedFromETH),
  },
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromETH),
  },
  /* broken at the moment, add back in later
  osmosis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    terra: osmosisSupply(DAI),
  },
  */
};

export default adapter;
