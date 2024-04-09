require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  defaultNetwork: "testnet",
  networks: {
    testnet: {
      // url: "https://pool.arkhia.io/hedera/testnet/json-rpc/v1/03Gef8mb4aY1622ac34C3mW7cW6Y2G29",
      // chainId: 296,
      // accounts: [process.env.OWNER_KEY, process.env.BUYER_KEY],
      url: process.env.API_url,
      chainId: 296,
      accounts: [process.env.TESTNET_OPERATOR_PRIVATE_KEY]
    },
}};
