const { masterChefExports, } = require("../helper/masterchef");
const { mergeExports, } = require("../helper/utils");
const { staking, } = require("../helper/staking")
const abiChefCzb = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCzbPerShare)",
    "poolLength": "uint256:poolLength"
  };
const abiChefCzf = {
    "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCzfPerShare)",
    "poolLength": "uint256:poolLength"
  };


const czr = "0x5cd0c2C744caF04cda258Efc6558A3Ed3defE97b";

const czf = "0x7c1608C004F20c3520f70b924E2BfeF092dA0043";
const chefCzf = "0xba968e7Ac9879eE5b0248e0CdBF0e4e82771C62D";
const czb = "0xD963b2236D227a0302E19F2f9595F424950dc186";
const chefCzb = "0xDe06B35D763b6d73128B1185b778402B667fe071";

const czrPoolWrappers = [
    "0xd06217a2d18c2b26fae3e649cd2de133f573ab43",
    "0x003cccc78ebe57c6dcd57e4c49b24d7dec074893",
    "0x989d7c902c1c33af1a6018b6f2713c49c5052677",
    "0xf24ee6519c14d60e8b97ef802f5fac53d323e7fc",
    "0x770Ca266f6eFf94880e60D4276fE708FF498a61F",
    "0xBeFE5F7c282c9Cb5A333892E2e600b28d80699c7",
    "0x39e18C777A3FfC6B2Bc9B0485486E54DFBFEF165",
    "0x2cfc10F03570C05713bEF29006ec018Cd4de8E51"
]

module.exports = mergeExports([
    masterChefExports(chefCzf, "bsc", czf, false, abiChefCzf.poolInfo),
    masterChefExports(chefCzb, "bsc", czb, true, abiChefCzb.poolInfo),
    {
        bsc: {
            staking: staking(
                czrPoolWrappers,
                czr,
                'bsc')
        }
    }
]);