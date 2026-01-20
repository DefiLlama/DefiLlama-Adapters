const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const ITP_VAULT_ADDRRESS= '0x23371aEEaF8718955C93aEC726b3CAFC772B9E37'
const ITP_ON_OPTIMISM = "0x0a7B751FcDBBAA8BB988B9217ad5Fb5cfe7bf7A0";
const VELO_PRICE_ORACLE = "0x395942C2049604a314d39F370Dfb8D87AAC89e16";
const WETH_TOKEN_ADDRESS = ADDRESSES.optimism.WETH_1;
const VELO_TOKEN_ADDRESS = "0x3c8b650257cfb5f272f799f5e2b4e65093a11a05";
const OP_TOKEN_ADDRESS = ADDRESSES.optimism.OP;
const USDC_OP_TOKEN_ADDRESS = ADDRESSES.optimism.USDC_CIRCLE;
const ITP_STAKED_ABI = "function getVaultInfo() view returns (uint256, uint256, uint256, uint256, uint256, uint256[], uint256)";

// Auto-compounder vault contracts and their corresponding LP tokens
const AUTO_COMPOUNDERS = [
  { vault: "0x569D92f0c94C04C74c2f3237983281875D9e2247", lp: "0xC04754F8027aBBFe9EeA492C9cC78b66946a07D1" }, // ITP/VELO
  { vault: "0xFCEa66a3333a4A3d911ce86cEf8Bdbb8bC16aCA6", lp: "0x3d5cbc66c366a51975918a132b1809c34d5c6fa2" }, // ITP/DHT
  { vault: "0x2811a577cf57A2Aa34e94B0Eb56157066717563f", lp: "0xdAD7B4C48b5B0BE1159c674226BE19038814eBf6" }, // ITP/wstETH
  { vault: "0x8A2e22BdA1fF16bdEf27b6072e087452fa874b69", lp: "0x79F1af622FE2C636a2d946F03A62D1DfC8cA6de4" }, // ITP/OP
  { vault: "0x3092F8dE262F363398F15DDE5E609a752938Cc11", lp: "0x93e40C357C4Dc57b5d2B9198a94Da2bD1C2e89cA" }, // ITP/WBTC
  { vault: "0xC4628802a42F83E5bce3caB05A4ac2F6E485F276", lp: "0x7e019a99f0dee5796db59c571ae9680c9c866a8e" }, // ITP/USDC
];

const getStakedTVL = async (api) => {
  const { chain } = api
  let stakedTVL = 0;
  if(chain === 'optimism'){
    const fetchVeloPrice = await api.call( {
      abi: "function getManyRatesWithConnectors(uint8, address[]) view returns (uint256[] memory rates)",
      target: VELO_PRICE_ORACLE,
      params: [
        1,
        [
          ITP_ON_OPTIMISM,
          VELO_TOKEN_ADDRESS,
          WETH_TOKEN_ADDRESS,
          OP_TOKEN_ADDRESS,
          USDC_OP_TOKEN_ADDRESS,
        ],
      ],
    })
    const price = parseInt(fetchVeloPrice[0]) / Math.pow(10, 18)
  
    const stakedBalance = await api.call({
      abi: ITP_STAKED_ABI,
      target: ITP_VAULT_ADDRRESS,
    });
    const staked =  parseInt(stakedBalance[0]) / Math.pow(10, 18)
    stakedTVL = staked * price
  }
  api.addUSDValue(stakedTVL)
}

// Auto-compounder TVL: fetches LP token balances from vaults and unwraps them
const getAutoCompounderTVL = async (api) => {
  // Get the LP token balances held by all auto-compounder vault contracts
  const balances = await api.multiCall({
    abi: "uint256:balance",
    calls: AUTO_COMPOUNDERS.map(ac => ac.vault),
  });

  // Add LP tokens and their balances to the API
  AUTO_COMPOUNDERS.forEach((ac, i) => {
    api.add(ac.lp, balances[i]);
  });

  // Unwrap LP tokens to get underlying asset values
  return sumTokens2({ api, resolveLP: true });
}

module.exports = {
  methodology: "Tracks ITP staking vault TVL using VELO price oracle, and auto-compounder vault TVL by unwrapping LP tokens held in 6 vault contracts. Auto-compounders automatically compound VELO rewards back into LP positions.",
  optimism: {
    tvl: getAutoCompounderTVL,
    staking: getStakedTVL
  },
}
