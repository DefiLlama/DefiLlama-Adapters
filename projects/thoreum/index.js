const { masterChefExports } = require("../helper/masterchef");

const thoreum = "0x580dE58c1BD593A43DaDcF0A739d504621817c05";
const masterchef = "0xF4168CD3C00799bEeB9a88a6bF725eB84f5d41b7";

module.exports = {
  ...masterChefExports(masterchef, "bsc", thoreum),
};
