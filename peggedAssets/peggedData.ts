import { baseIconsUrl } from "../constants";
import type { PeggedAsset } from "./types";

export type { PeggedAsset };

export const peggedCategoryList = ["stablecoins"]; // this should include all strings from union type PeggedCategory

/*
`chain` is the first chain of a protocol we tracked at defillama,
  so if a protocol launches on Ethereum and we start tracking it there, and then it launches on polygon and
  we start tracking it on both polygon and ethereum, then `chain` should be set to `Ethereum`.

`chains` is not used by the current code, but good to fill it out because it is used in our test to detect errors
*/

export default [
  {
    id: "1",
    name: "Tether",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    symbol: "USDT",
    url: "https://tether.to/",
    description:
      "Tether tokens offer the stability and simplicity of fiat currencies coupled with the innovative nature of blockchain technology, representing a perfect combination of both worlds.",
    chain: "Ethereum",
    logo: `${baseIconsUrl}/tether.png`,
    gecko_id: "tether",
    cmcId: "825",
    category: "stablecoins", // is for the frontend
    pegType: "peggedUSD", // should match balance key returned by adapter
    chains: [
      "Ethereum",
      "Polygon",
      "BSC",
      "Avalanche",
      "Solana",
      "Arbitrum",
      "Optimism",
      "Boba",
      "Metis",
      "Moonbeam",
      "KCC",
      "Moonriver",
      "Harmony",
      "Syscoin",
      "Heco",
      "OKExChain",
      "IoTeX",
      "Omni",
      "Aurora",
      "Algorand",
      "Milkomeda",
      "Kardia",
      "Telos",
      "Fuse",
      "TomoChain",
      "Meter",
      "Tron",
      "Liquidchain",
      "Bittorrent",
      "Crab",
      "EOS",
      "Statemine",
      "Evmos",
      "Oasis",
      "Terra",
      "Astar",
      "Gnosis",
      "Theta",
      "RSK",
      "REINetwork",
      "Loopring",
      "zkSync",
      "Shiden",
      "Fantom",
    ],
    bridges: {
      Ethereum: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
      Heco: {
        bridge: "HECO Chain Bridge",
        link: "https://www.hecochain.com/",
      },
      Avalanche: {
        bridge: "Avalanche Bridge",
        link: "https://bridge.avax.network/",
      },
      OKExChain: {
        bridge: "OKX Bridge",
        link: "https://www.okx.com/okx-bridge",
      },
      Polygon: {
        bridge: "Polygon PoS Bridge",
        link: "https://polygon.technology/",
      },
      Arbitrum: {
        bridge: "Arbitrum L1 Custom Gateway",
        link: "https://arbitrum.io/",
      },
      Aurora: {
        bridge: "NEAR Rainbow Bridge",
        link: "https://rainbowbridge.app/",
      },
      Harmony: {
        bridge: "Horizon Bridge by Harmony",
        link: "https://bridge.harmony.one/",
      },
      Metis: {
        bridge: "Metis Andromeda Bridge",
        link: "https://www.metis.io/",
      },
      KCC: {
        bridge: "Kucoin Bridge",
        link: "https://www.Kucoin.io/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Optimism: {
        bridge: "Optimistic Ethereum Gateway",
        link: "https://gateway.optimism.io/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Milkomeda: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Boba Gateway",
        link: "https://gateway.boba.network/",
      },
      IoTeX: {
        bridge: "ioTube V5",
        link: "https://iotube.org/",
      },
      Kardia: {
        bridge: "KAI Bridge",
        link: "https://bridge.kaidex.io/",
      },
      Telos: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fuse: {
        bridge: "Fuse Bridge",
        link: "https://voltage.finance/",
      },
      TomoChain: {
        bridge: "TomoBridge",
        link: "https://bridge.TomoChain.com/",
      },
      Meter: {
        bridge: "Meter Passport",
        link: "https://passport.meter.io/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Oasis: {
        bridge: "EVODeFi",
        link: "https://bridge.evodefi.com/",
      },
      Bittorrent: {
        bridge: "Bittorrent Bridge",
        link: "https://bttc.bittorrent.com/",
      },
      Evmos: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Terra: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Crab: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Astar: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Gnosis: {
        bridge: "Gnosis Chain OmniBridge",
        link: "https://omni.gnosischain.com/",
      },
      Theta: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      RSK: {
        bridge: "RSK Token Bridge",
        link: "https://tokenbridge.rsk.co/",
      },
      REINetwork: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Loopring: {
        bridge: "Loopring",
        link: "https://loopring.org/",
      },
      zkSync: {
        bridge: "zkSync",
        link: "https://zksync.io/",
      },
      Shiden: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
    },
    twitter: "https://twitter.com/Tether_to",
  },
  {
    id: "2",
    name: "USD Coin",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    symbol: "USDC",
    url: "https://www.circle.com/usdc/",
    description: "Digital dollars for global business.",
    chain: "Ethereum",
    logo: `${baseIconsUrl}/usd-coin.png`,
    gecko_id: "usd-coin",
    cmcId: "3408",
    category: "stablecoins",
    pegType: "peggedUSD",
    chains: [
      "Ethereum",
      "Polygon",
      "BSC",
      "Solana",
      "Avalanche",
      "Arbitrum",
      "Optimism",
      "Boba",
      "Metis",
      "KCC",
      "Moonriver",
      "Harmony",
      "OKExChain",
      "Moonbeam",
      "Syscoin",
      "TomoChain",
      "Ronin",
      "Aurora",
      "Fuse",
      "Meter",
      "Telos",
      "Milkomeda",
      "Elastos",
      "Algorand",
      "Tron",
      "Terra",
      "Oasis",
      "Crab",
      "Evmos",
      "Astar",
      "Hedera",
      "Stellar",
      "Flow",
      "Gnosis",
      "Theta",
      "RSK",
      "REINetwork",
      "Loopring",
      "zkSync",
      "Shiden",
      "Fantom",
    ],
    bridges: {
      Ethereum: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Polygon: {
        bridge: "Polygon PoS Bridge",
        link: "https://polygon.technology/",
      },
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
      Avalanche: {
        bridge: "Avalanche Bridge",
        link: "https://bridge.avax.network/",
      },
      Harmony: {
        bridge: "Horizon Bridge by Harmony",
        link: "https://bridge.harmony.one/",
      },
      Arbitrum: {
        bridge: "Arbitrum L1 Custom Gateway",
        link: "https://arbitrum.io/",
      },
      OKExChain: {
        bridge: "OKX Bridge",
        link: "https://www.okx.com/okx-bridge",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Boba Gateway",
        link: "https://gateway.boba.network/",
      },
      Optimism: {
        bridge: "Optimistic Ethereum Gateway",
        link: "https://gateway.optimism.io/",
      },
      Metis: {
        bridge: "Metis Andromeda Bridge",
        link: "https://www.metis.io/",
      },
      KCC: {
        bridge: "Kucoin Bridge",
        link: "https://www.Kucoin.io/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      TomoChain: {
        bridge: "TomoBridge",
        link: "https://bridge.TomoChain.com/",
      },
      Ronin: {
        bridge: "Ronin Bridge",
        link: "https://bridge.roninchain.com/",
      },
      Aurora: {
        bridge: "NEAR Rainbow Bridge",
        link: "https://rainbowbridge.app/",
      },
      Fuse: {
        bridge: "Fuse Bridge",
        link: "https://voltage.finance/",
      },
      Meter: {
        bridge: "Meter Passport",
        link: "https://passport.meter.io/",
      },
      Telos: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Milkomeda: {
        // may need to be updated
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Elastos: {
        bridge: "ShadowTokens",
        link: "https://tokbridge.net/",
      },
      Terra: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Oasis: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Crab: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Evmos: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Astar: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Gnosis: {
        bridge: "Gnosis Chain OmniBridge",
        link: "https://omni.gnosischain.com/",
      },
      Theta: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      RSK: {
        bridge: "RSK Token Bridge",
        link: "https://tokenbridge.rsk.co/",
      },
      REINetwork: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Loopring: {
        bridge: "Loopring",
        link: "https://loopring.org/",
      },
      zkSync: {
        bridge: "zkSync",
        link: "https://zksync.io/",
      },
      Shiden: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
    },
    twitter: "",
  },
  {
    id: "3",
    name: "TerraUSD",
    address: "",
    symbol: "UST",
    url: "https://www.terra.money/",
    description: "Programmable money for the internet.",
    chain: "Terra",
    logo: `${baseIconsUrl}/terrausd.png`,
    gecko_id: "terrausd",
    cmcId: "7129",
    category: "stablecoins",
    pegType: "peggedUSD",
    chains: [
      "Terra",
      "Ethereum",
      "Polygon",
      "BSC",
      "Solana",
      "Harmony",
      "Fantom",
      "Aurora",
      "Avalanche",
      "Osmosis",
      "Moonbeam",
      "Oasis",
      "Celo",
      "Fuse",
    ],
    bridges: {
      Ethereum: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      BSC: {
        bridge: "Terra Shuttle Bridge",
        link: "https://bridge.terra.money/",
      },
      Harmony: {
        bridge: "Terra Shuttle Bridge",
        link: "https://bridge.terra.money/",
      },
      Aurora: {
        bridge: "Allbridge",
        link: "https://allbridge.io/",
      },
      Polygon: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Fantom: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Avalanche: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Osmosis: {
        bridge: "Terra Shuttle Bridge",
        link: "https://bridge.terra.money/",
      },
      Moonbeam: {
        bridge: "Axelar",
        link: "https://axelar.network/",
      },
      Oasis: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Celo: {
        bridge: "Allbridge",
        link: "https://allbridge.io/",
      },
      Fuse: {
        bridge: "Allbridge",
        link: "https://allbridge.io/",
      },
    },
    twitter: "https://twitter.com/terra_money",
  },
  {
    id: "4",
    name: "Binance USD",
    address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    symbol: "BUSD",
    url: "https://www.binance.com/en/busd",
    description:
      "BUSD is a 1:1 USD-backed stablecoin approved by the New York State Department of Financial Services (NYDFS), issued in partnership with Paxos.",
    chain: "Ethereum",
    logo: `${baseIconsUrl}/binance-usd.png`,
    gecko_id: "binance-usd",
    cmcId: "4687",
    category: "stablecoins",
    pegType: "peggedUSD",
    chains: [
      "Ethereum",
      "BSC",
      "Avalanche",
      "Harmony",
      "IoTeX",
      "OKExChain",
      "Moonriver",
      "Solana",
      "Polygon",
      "Fuse",
      "Meter",
      "Moonbeam",
      "Milkomeda",
      "Elastos",
      "Aurora",
      "Oasis",
      "Terra",
      "Shiden",
      "Astar",
      "Evmos",
      "Syscoin",
      "Boba",
      "Metis",
      "Fantom",
      "KCC",
      "RSK",
      "Theta",
    ],
    bridges: {
      Ethereum: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
      Avalanche: {
        bridge: "Avalanche Bridge",
        link: "https://bridge.avax.network/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Harmony: {
        bridge: "Horizon Bridge by Harmony",
        link: "https://bridge.harmony.one/",
      },
      IoTeX: {
        bridge: "ioTube V5",
        link: "https://iotube.org/",
      },
      OKExChain: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Polygon: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Fuse: {
        bridge: "Fuse Bridge",
        link: "https://voltage.finance/",
      },
      Meter: {
        bridge: "Meter Passport",
        link: "https://passport.meter.io/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Milkomeda: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Elastos: {
        bridge: "ShadowTokens",
        link: "https://tokbridge.net/",
      },
      Aurora: {
        bridge: "Allbridge",
        link: "https://allbridge.io/",
      },
      Terra: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Oasis: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Shiden: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Astar: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Evmos: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Metis: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      KCC: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      RSK: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Theta: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
    },
    twitter: "https://twitter.com/PaxosGlobal",
  },
  {
    id: "5",
    name: "Dai",
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    symbol: "DAI",
    url: "https://makerdao.com/",
    description:
      "Dai is a stable, decentralized currency that does not discriminate. Any individual or business can realize the advantages of digital money.",
    chain: "Ethereum",
    logo: `${baseIconsUrl}/dai.png`,
    gecko_id: "dai",
    cmcId: "4943",
    category: "stablecoins",
    pegType: "peggedUSD",
    chains: [
      "Ethereum",
      "Solana",
      "Polygon",
      "BSC",
      "Optimism",
      "Harmony",
      "Avalanche",
      "Arbitrum",
      "Moonriver",
      "Aurora",
      "Fantom",
      "Moonbeam",
      "Syscoin",
      "Milkomeda",
      "Astar",
      "Oasis",
      "Evmos",
      "Gnosis",
      "Terra",
      "RSK",
      "REINetwork",
      "Loopring",
      "zkSync",
      "Aztec",
      "Velas",
      "Shiden",
      "Boba",
    ],
    bridges: {
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Polygon: {
        bridge: "Polygon PoS Bridge",
        link: "https://polygon.technology/",
      },
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
      Optimism: {
        bridge: "Optimistic Ethereum Gateway",
        link: "https://gateway.optimism.io/",
      },
      Harmony: {
        bridge: "Horizon Bridge by Harmony",
        link: "https://bridge.harmony.one/",
      },
      Avalanche: {
        bridge: "Avalanche Bridge",
        link: "https://bridge.avax.network/",
      },
      Arbitrum: {
        bridge: "Arbitrum L1 Custom Gateway",
        link: "https://arbitrum.io/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Aurora: {
        bridge: "NEAR Rainbow Bridge",
        link: "https://rainbowbridge.app/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Milkomeda: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Astar: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Oasis: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Evmos: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Gnosis: {
        bridge: "Gnosis Chain OmniBridge",
        link: "https://omni.gnosischain.com/",
      },
      Terra: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      RSK: {
        bridge: "RSK Token Bridge",
        link: "https://tokenbridge.rsk.co/",
      },
      REINetwork: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Loopring: {
        bridge: "Loopring",
        link: "https://loopring.org/",
      },
      zkSync: {
        bridge: "zkSync",
        link: "https://zksync.io/",
      },
      Aztec: {
        bridge: "Aztec",
        link: "https://zk.money/",
      },
      Velas: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      KCC: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Shiden: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Boba Gateway",
        link: "https://gateway.boba.network/",
      },
    },
    twitter: "https://twitter.com/MakerDAO",
  },
  {
    id: "6",
    name: "Frax",
    address: "0x853d955acef822db058eb8505911ed77f175b99e",
    symbol: "FRAX",
    url: "https://frax.finance/",
    description: "Frax is the world’s first fractional-algorithmic stablecoin.",
    chain: "Ethereum",
    logo: `${baseIconsUrl}/frax.png`,
    gecko_id: "frax",
    cmcId: "6952",
    category: "stablecoins",
    pegType: "peggedUSD",
    chains: [
      "Ethereum",
      "BSC",
      "Avalanche",
      "Arbitrum",
      "Aurora",
      "Boba",
      "Fantom",
      "Evmos",
      "Harmony",
      "Moonbeam",
      "Moonriver",
      "Optimism",
      "Polygon",
      "Solana",
      "zkSync",
      "Milkomeda",
    ],
    bridges: {
      BSC: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Avalanche: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Arbitrum: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Aurora: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Evmos: {
        bridge: "Nomad",
        link: "https://www.nomad.xyz/",
      },
      Harmony: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Optimism: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Polygon: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      zkSync: {
        bridge: "zkSync",
        link: "https://zksync.io/",
      },
      Milkomeda: {
        bridge: "Nomad",
        link: "https://www.nomad.xyz/",
      },
    },
    twitter: "https://twitter.com/fraxfinance",
  },
  {
    id: "7",
    name: "TrueUSD",
    address: "0x0000000000085d4780b73119b644ae5ecd22b376",
    symbol: "TUSD",
    url: "https://trueusd.com/",
    description: "The first regulated stablecoin fully backed by the US Dollar.",
    chain: "Ethereum",
    logo: `${baseIconsUrl}/true-usd.png`,
    gecko_id: "true-usd",
    cmcId: "2563",
    category: "stablecoins",
    pegType: "peggedUSD",
    chains: [
      "Ethereum",
      "BSC",
      "Avalanche",
      "Polygon",
      "Arbitrum",
      "Fantom",
      "Tron",
      "Syscoin",
      "Heco",
      "Cronos",
    ],
    bridges: {
      BSC: {
        bridge: "-",
      },
      Avalanche: {
        bridge: "-",
      },
      Polygon: {
        bridge: "-",
      },
      Arbitrum: {
        bridge: "-",
      },
      Fantom: {
        bridge: "-",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Heco: {
        bridge: "-",
      },
    },
    twitter: "https://twitter.com/tusdio",
  },
] as PeggedAsset[];
