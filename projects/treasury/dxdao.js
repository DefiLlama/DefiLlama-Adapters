const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x519b70055af55a007110b4ff99b0ea33071c720a";
const DXD = "0xa1d65e8fb6e87b60feccbc582f7f97804b725521";

module.exports = treasuryExports({
    ethereum: {
      tokens: [ 
          nullAddress,
          '0x6cAcDB97e3fC8136805a9E7c342d866ab77D0957',//swapr
          '0x6B175474E89094C44Da98b954EedeAC495271d0F',//dai
          '0xFe2e637202056d30016725477c5da089Ab0A043A',//seth2
          '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//usdc
          '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',//lusd
          '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',//steth
          '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',//ens
          '0xae78736Cd615f374D3085123A210448E74Fc6393',//reth
          '0x20BC832ca081b91433ff6c17f85701B6e92486c5',//reth2
          '0xEd91879919B71bB6905f23af0A68d231EcF87b14',//dmg
          '0x93ED3FBe21207Ec2E8f2d3c3de6e058Cb73Bc04d',//pnk
          '0xF5581dFeFD8Fb0e4aeC526bE659CFaB1f8c781dA',//hopr
          '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//weth
       ],
      owners: [treasury],
      ownTokens: [DXD],
    },
  })