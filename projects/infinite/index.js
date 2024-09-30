const { sliceIntoChunks } = require("@defillama/sdk/build/util");

/* *** dHEDGE V2 *** */
const DHEDGE_V2_VAULT_SUMMARY_ABI =
  "function getFundSummary() view returns (tuple(string name, uint256 totalSupply, uint256 totalFundValue))";
// Our Vaults
const INFINITE_MANAGED_VAULTS = [
"0xa2ffe6ed599e8f7aac8047f5ee0de3d83de1b320",
"0x08837d4bc031b9f7641e25cc901d91424081a176",
"0x54db076bfac96c02e9a2a66410d69f35ac481fe6",
"0xe51af0ba747b9c464057b9099040f4df0b29a7de",
"0xb48a390270d41a1663a68708210b7ef4d89ba9f6",
"0x0e7ba4af3b39c8fd5cc5619aecdfecb3316fd6a1",
"0x423582afb8e8693a427bf67d76adf9f6a8e33124",
"0x31e109968aa38542c4d9efb9a2daa34b442efa44",
"0x0889d928cf4e6841d6a55822b521524096b34320",
"0xd770898671f6d73c6206a4517d7c92d392ce4b9f",
"0x906b3fa71f011eda7643aad064ad5c38015846d1",
"0xa50f3446445a1e09546d003b30c798377e97c7e4",
"0xe8f78aaa6ac51db0ea5fe64340cbe724c2fa0079",
"0x37acdfc02b78b53c9a0e21a58746cc71e23a8f05",
"0xd8e1ed48f2ff726642e1caeae2dafc8a2f9aef01",
"0xc3f232c00ab6ce31a332126331da3f74ca1d51cc",
"0x948720ff3f5f26f889b42e22ee8d1c23da5063a3",
"0xc3ffa8d537e31ebf83e7f5f43b481c8101545352",
"0x7e95ed8b07155c7f212ce891391d512757438f01",
"0xe4824fb9b7af29ecc0efa5c88e28262ac55822ba"
]

const ITP_VAULT_ADDRRESS= '0x23371aEEaF8718955C93aEC726b3CAFC772B9E37'
const ITP_ON_OPTIMISM = "0x0a7B751FcDBBAA8BB988B9217ad5Fb5cfe7bf7A0";
const VELO_PRICE_ORACLE = "0x395942C2049604a314d39F370Dfb8D87AAC89e16";
const WETH_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000006";
const OP_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000042";
const USDC_OP_TOKEN_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
const ITP_STAKED_ABI = "function getVaultInfo() view returns (uint256, uint256, uint256, uint256, uint256, uint256[], uint256)";
const tvl = async (api) => {
  const { chain } = api
  const vaults = INFINITE_MANAGED_VAULTS
  let chunkSize = chain === 'optimism' ? 42 : 51 // Optimism has a lower gas limit
  
  const vaultChunks = sliceIntoChunks(vaults, chunkSize);
  const summaries = [];
  for (const chunk of vaultChunks) {
    summaries.push(...await api.multiCall({ abi: DHEDGE_V2_VAULT_SUMMARY_ABI, calls: chunk, permitFailure: true,  }))
  }
  const totalValueLocked = summaries.reduce((acc, vault) => acc + +(vault?.totalFundValue ?? 0), 0);
  const stakedTVL = await getStakedTVL(api)
  
  return {
    tether: (totalValueLocked / 1e18) + stakedTVL,
  };
};



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
  return stakedTVL
}

module.exports = {
  methodology: "Aggregates total value of each of our managed vaults on dHEDGE and our locked tokens in our custom contract.",
  polygon: {
    tvl,
  },
  optimism: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
  base: {
    tvl,
  },
  misrepresentedTokens: true,
}
