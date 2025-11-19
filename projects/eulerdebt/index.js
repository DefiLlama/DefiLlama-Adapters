const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

// HybridDebtMarket contract address (same on all chains via CREATE2)
const MARKETPLACE_CONTRACT = '0x3333cb20c3C7491CA9fa7281a8B418512d7a9a22';

// Known Euler vaults and common tokens per chain
const KNOWN_TOKENS = {
  ethereum: [
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.USDT,
    ADDRESSES.ethereum.DAI,
    ADDRESSES.ethereum.WETH,
    ADDRESSES.ethereum.WBTC,
    // Add Euler vault addresses here as they're deployed
  ],
  avax: [
    ADDRESSES.avax.USDC,
    ADDRESSES.avax.USDC_e,
    ADDRESSES.avax.USDT_e,
    ADDRESSES.avax.WAVAX,
    ADDRESSES.avax.WETH_e,
    ADDRESSES.avax.WBTC_e,
    // Euler vaults on Avalanche (all clusters + Euler Earn)
    '0x9B1DC432150cEF8f129A9eEa3CA8364d0b06904f',
    '0xb4bc9D19D827893e0a21c2F4E7B527A5f8525C3f',
    '0xAF0d176Daa761d105E688EE70060b1FF9540e0cb',
    '0x3C69C59075269cAf0571F9d2eFC359bcBD4e29bB',
    '0xA06e66646292b2C2042495B955fe07c4036f6635',
    '0xb52a9c3aea75939a78287F81b53A9e965e058eec',
    '0x38a559c2b6eF3fF7Cdc40a800D6351a2B70b2243',
    '0xADaFfbEBEEAd3D3e042C3e7c146F61FE62728e6c',
    '0xB1Ec13C66fdb12205C6C82c392a5A3b393207388',
    '0xA429273b892c2c90b1d90778f4786e6470F402eC',
    '0x1Ff8f20dFF1dA13fEdD975224b580766dbB7634e',
    '0x5cB6F04682299eB196F7d673c09a04DF68028071',
    '0x69B07dB605d0A08fbE9245c1466880AA36c8E1A7',
    '0x152179bfc75f780bFe5b0d3c0D3c797108fB24C3',
    '0x91bFd7192990c2A56dF4AceFf5Fe063B75b636A5',
    '0x82131b7601dE10a7e28d371F1b672205195E4e5D',
    '0x6E65eB6cAC41a19E0B8bb16F3b5Ad150f9124D3d',
    '0xd058fbF3aC2E1bCa615EB127c2b94AF1b3Be11A9',
    '0x51b47B3013863c52CA28D603De3C2d7a5FEf50B9',
    '0x76DE251BeE4A3B902857f6A0fCe8a320C4167E40',
    '0x4d758aB40Abb122402F01e1ec4C71ACb06A1f620',
    '0x38eA4c0724b20B02e5fdE235F657a3aFc184f5aC',
    '0x5FDb07efb2DafAc9186C8A7902332ce0F4B764C6',
    '0xb032772229B2af29EaA026D1648bB9bC42bB0592',
    '0x04293b180bf9C57eD0923C99c784Cb571f0A9Ae9',
    '0xA321a38b03a7218157668a724E186f3a81CF56c8',
    '0x37ca03aD51B8ff79aAD35FadaCBA4CEDF0C3e74e',
    '0x3F96e387eC6462DFBe9F05838943D19307dD2752',
    '0xF983f92bd962A94EAc85a8c58237C1CC1cDfBBBa',
    '0xbaC3983342b805E66F8756E265b3B0DdF4B685Fc',
    '0xf3aCc3Fc22E376fa3dD21CF883B60DDE9cf4E34f',
    '0x6b640afFdE7cFa8322cA5c7F8bB7d276de3d30A3',
    '0x39dE0f00189306062D79eDEC6DcA5bb6bFd108f9',
    '0x2137568666f12fc5A026f5430Ae7194F1C1362aB',
    '0xA45189636c04388ADBb4D865100DD155e55682EC',
    '0xFECebF56f150A68dDd197c3a6101da35C46693Ac',
    '0x6c718a70239fA548c0bD268fE88F37EBE8b6E2ea',
    '0xABA9d2D4b6B93C3dc8976D8eb0690CCA56431FE4',
    '0x4eC5B9a4d4FD9E35d4f881D35AAB9877bfdA5803',
    '0x7485484Dab196C615AE21453C3ABd732977562f2',
    '0x27807C61F6b376754b7ce208AA8b17D2DA56d582',
    '0x72F92a966f1874f74e1b601BEe7CF57031B53A03',
    '0x9298D274A31803bb73c2A5E5EcDd101c581C4AfD',
    '0x6fC9b3a52944A577cd8971Fd8fDE0819001bC595',
    '0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E',
    '0xe1E549C965A4A0514D9bf80161D32924b8694822',
    '0xb9CC370a8f19322FC4BF69Da80c6C39FF8F2dB90',
    '0x5030183B3DD0105d69D7d45595C120Fc4b542EC3',
    '0x03ef14425CF0d7Af62Cdb8D6E0Acb0b0512aE35C',
    '0xe91841F707936faf515ff6d478624A325A4f9199',
  ],
  plasma: [
    ADDRESSES.null, // Native token
    // Add Plasma tokens as needed
  ],
  bsc: [
    ADDRESSES.bsc.USDC,
    ADDRESSES.bsc.USDT,
    ADDRESSES.bsc.DAI,
    ADDRESSES.bsc.WBNB,
    ADDRESSES.bsc.BTCB,
    ADDRESSES.bsc.ETH,
  ],
  base: [
    ADDRESSES.base.USDC,
    ADDRESSES.base.USDbC,
    ADDRESSES.base.DAI,
    ADDRESSES.base.WETH,
  ],
  arbitrum: [
    ADDRESSES.arbitrum.USDC,
    ADDRESSES.arbitrum.USDT,
    ADDRESSES.arbitrum.DAI,
    ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.WBTC,
  ],
  linea: [
    ADDRESSES.linea.USDC,
    ADDRESSES.linea.USDT,
    ADDRESSES.linea.WETH,
  ],
  sonic: [
    ADDRESSES.sonic.USDC_e,
    ADDRESSES.sonic.scUSD,
  ],
  unichain: [
    ADDRESSES.null, // Add Unichain tokens as they're used
  ],
  swellchain: [
    ADDRESSES.null, // Add Swellchain tokens as they're used
  ],
  tac: [
    ADDRESSES.null, // Add TAC tokens as they're used
  ],
  bob: [
    ADDRESSES.null, // Add BOB tokens as they're used
  ],
  berachain: [
    ADDRESSES.null, // Add Berachain tokens as they're used
  ],
};

async function tvl(api) {
  const chain = api.chain;
  const tokens = KNOWN_TOKENS[chain] || [];

  // Filter out null addresses
  const validTokens = tokens.filter(t => t !== ADDRESSES.null);

  if (validTokens.length === 0) {
    return {};
  }

  // Sum all token balances held by the marketplace
  return sumTokens2({
    api,
    owner: MARKETPLACE_CONTRACT,
    tokens: validTokens,
    resolveLP: true, // Auto-resolve LP tokens and ERC4626 vaults to their underlying
  });
}

module.exports = {
  methodology: "Counts all debt tokens and payment tokens locked in active buy and sell orders on the HybridDebtMarket orderbook",
  ethereum: { tvl },
  avax: { tvl },
  plasma: { tvl },
  bsc: { tvl },
  base: { tvl },
  arbitrum: { tvl },
  linea: { tvl },
  sonic: { tvl },
  unichain: { tvl },
  swellchain: { tvl },
  tac: { tvl },
  bob: { tvl },
  berachain: { tvl },
};
