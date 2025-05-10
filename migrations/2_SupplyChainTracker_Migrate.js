const ManufacturerContract = artifacts.require("ManufacturerContract");
const LogisticsContract = artifacts.require("LogisticsContract");
const RetailerWarehouseContract = artifacts.require("RetailerWarehouseContract");

module.exports = function(deployer) {
  deployer.deploy(ManufacturerContract)
    .then(() => deployer.deploy(LogisticsContract))
    .then(() => deployer.deploy(RetailerWarehouseContract));
};