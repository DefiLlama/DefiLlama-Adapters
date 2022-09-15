const { tombTvl } = require('../helper/tomb');

const bond = "0x046cb616d7a52173e4Da9efF1BFd590550aa3228";
const share = "0x66ec6e9f61ac288f5ba661cd9a2dbe3abf9871c9";
const boardroom = "0x73c34f572a428c0fc298e9a2ae45d01e87713e8f";
const rewardPool = "0x4d24484a5944b6a8e2bc9af74c6d44c47767b150";
const pool2lps = [
  '0xe34973e9c89a9a1d2886379ce52d32dde296ca22',
  '0x9f4daa971e76e3d0c68c9983125e35c0f89b077a',
  '0xe61Db569E231B3f5530168Aa2C9D50246525b6d6',
  '0x062b7d86c51aa3b2ec998272b5bd0609e95b3661',
  '0xfd0cd0c651569d1e2e3c768ac0ffdab3c8f4844f',
  '0xa111c17f8b8303280d3eb01bbcd61000aa7f39f9',
];

module.exports = {
    ...tombTvl(bond, share, rewardPool, boardroom, pool2lps, "cronos", undefined, true, pool2lps[1])
};