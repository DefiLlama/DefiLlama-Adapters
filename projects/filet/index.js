
const abi = require("./abi.js") 
const { fetchURL } = require('../helper/utils')


const BigNumber = require("bignumber.js")
const { nullAddress } = require("../helper/tokenMapping");
const { get } = require("../helper/http");

//bsc staking con
const filetStakingCon_BSC = "0x9c821defD3BBb07C5c786C3bB039051364Fa6F39";
const filetStakingConFlexible_BSC = "0xE989ef3118C685603B86123569340438ab670505";
//bsc FILE con
const filetFILECon_BSC = "0xA8F19840e08dC3f134FF45062b953a2B14E02F5A"
const filetStorageCon_FVM = "0xFca90089d63D099c80A4ae91edCdfC904c2afa8e";
const filetNativeCon = "0xBfd5BB742940a5b059710F4d1216db1F1287F4e0";

const filetStakingCon_HECO = "0x62C7aaCdCCEc32A2E33d5fa535B374f8a4a42566";
const filetStakingConFlexible_HECO = "0x64F23Eb153D7496Fc31C1b38a41068995354773E"

const poolOnFVM180 = 4010
const poolOnFVM360 = 4011

// filet 
const filetAPI = "https://api.filet.finance/pledge/ext/tx/pledgeTxAll"
const minerList = "https://api.filet.finance/pledge/pool/querySpList"
const { sumTokens2 } = require('../helper/unwrapLPs')


const getMinersList = async () => {
  const resp = await get(minerList)
  return resp.data.map(({minerId}) => {

      let bytes = Buffer.alloc(20);
      bytes.writeUint8(0xff, 0);
      bytes.writeBigUint64BE(BigInt(minerId), 12);
      return '0x' + bytes.toString('hex')
  });
}

// 

module.exports = {
  timetravel: false,
  heco: {
    tvl: async () => {
        const tvlData = await fetchURL(filetAPI)
        return {
          ["filecoin"]: new BigNumber(tvlData.data.data.hecoTvl),
        }
      }
  },
  bsc: {
    tvl: async () => {

        const tvlData = await fetchURL(filetAPI)
        return {
          ["filecoin"]: new BigNumber(tvlData.data.data.bscTvl),
        }
      
      }
  },
  filecoin: {
    tvl: async (api) => {

      const filetMpool180 = await api.call({    target: filetStorageCon_FVM,    abi: abi.filetFVMAbi, params:[poolOnFVM180] });
      const filetMpool360 = await api.call({    target: filetStorageCon_FVM,    abi: abi.filetFVMAbi, params:[poolOnFVM360] });

      const filetNative_hasSoldOutToken = await api.call({    target: filetNativeCon, abi: "uint256:hasSoldOutToken", params:[] });
      api.add(nullAddress, filetMpool180.mPool.hasSoldOutToken)
      api.add(nullAddress, filetMpool360.mPool.hasSoldOutToken )
      api.add(nullAddress, filetNative_hasSoldOutToken )
  
      // getMinersList
      const minerList = await getMinersList();
      let balances = await sumTokens2({ owner: filetStorageCon_FVM, tokens:[nullAddress], api, });
      return sumTokens2({balances, api, owners: minerList, tokens: [nullAddress]});
    },
  },
  mixin: {
    tvl: async (api) => {
      const tvlData = await fetchURL(filetAPI)
      return {
        ["filecoin"]: new BigNumber(tvlData.data.data.mixinTvl),
      }
    }
  }
}
