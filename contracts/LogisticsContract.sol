// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LogisticsContract {
    struct Product {
        string id;
        string name;
        string batch;
        string composition;
        string typeOfProduct;
        address payable manufacturer;
        address currentHolder;
        uint price;
        string status;
        string ipfsHash;
        address[] history;
        bool sold;
    }

    mapping(string => Product) public products;
    mapping(string => bool) public exists;
    string[] public allProductIds;

    event StatusUpdated(string id, string status, address updatedBy);

    modifier productExists(string memory _id) {
        require(exists[_id], "Product doesn't exist");
        _;
    }

    modifier onlyHolder(string memory _id) {
        require(products[_id].currentHolder == msg.sender, "Not holder");
        _;
    }

    // Interface for ManufacturerContract to register products
    function registerProduct(
        string memory _id,
        string memory _name,
        string memory _batch,
        string memory _composition,
        string memory _typeOfProduct,
        uint _price,
        address payable _manufacturer,
        string memory _ipfsHash
    ) external {
        require(!exists[_id], "Product already registered");
        
        Product storage p = products[_id];
        p.id = _id;
        p.name = _name;
        p.batch = _batch;
        p.composition = _composition;
        p.typeOfProduct = _typeOfProduct;
        p.price = _price;
        p.manufacturer = _manufacturer;
        p.currentHolder = _manufacturer;
        p.ipfsHash = _ipfsHash;
        p.status = "Manufactured";
        p.history = new address[](0);
        p.history.push(_manufacturer);
        p.sold = false;
        
        exists[_id] = true;
        allProductIds.push(_id);
    }

    function updateStatus(string memory _id, string memory _status)
        public
        productExists(_id)
    {
        products[_id].status = _status;
        products[_id].history.push(msg.sender);

        emit StatusUpdated(_id, _status, msg.sender);
    }

    function transferToWarehouse(string memory _id, address warehouse)
        public
        productExists(_id)
        onlyHolder(_id)
    {
        products[_id].currentHolder = warehouse;
        products[_id].history.push(warehouse);
        products[_id].status = "Delivered to Warehouse";
    }
}