const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

const bakiAddress = "0x8c1278D8b20ecEe71736F27181D3018E9a15652B";
const treasury = "0x6F996Cb36a2CB5f0e73Fc07460f61cD083c63d4b";
const usdc = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";

const provider = new ethers.providers.JsonRpcProvider(
  "https://api.avax.network/ext/bc/C/rpc"
);
const abiPath = path.resolve("./projects/baki/abi.json");
const rawData = fs.readFileSync(abiPath);
const contractABI = JSON.parse(rawData);


const tokenABIPath = path.resolve("./projects/baki/usdc.json");
const tokenRawData = fs.readFileSync(tokenABIPath);
const tokenABI = JSON.parse(tokenRawData);

const contract = new ethers.Contract(bakiAddress, contractABI, provider);
const tokenContract = new ethers.Contract(usdc, tokenABI, provider);

module.exports = {
  methodology: "",
  avax:{
    tvl: async () => {
      let tvl = await contract?.totalCollateral();
      return parseInt(ethers.utils.formatUnits(tvl, 0))/10**18;
    },

    treasury: async () => {
      const balance = await tokenContract?.balanceOf(treasury);
      return +ethers.utils.formatEther(balance);
    },
  },
 
};
