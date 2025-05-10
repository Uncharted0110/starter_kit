// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ManufacturerContract {
    uint private counter = 0;

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

    event ProductCreated(string id, string name, address manufacturer);

    modifier productExists(string memory _id) {
        require(exists[_id], "Product doesn't exist");
        _;
    }

    // Simple uint to string conversion
    function uint2str(uint _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function generateProductId(uint _counter) internal pure returns (string memory) {
        return string(abi.encodePacked("PROD-", uint2str(_counter)));
    }

    function createProduct(
        string memory _name,
        string memory _batch,
        string memory _composition,
        string memory _typeOfProduct,
        uint _price,
        string memory _ipfsHash
    ) public returns (string memory) {
        counter++;
        string memory _id = generateProductId(counter);
        require(!exists[_id], "Already exists");

        Product storage p = products[_id];
        p.id = _id;
        p.name = _name;
        p.batch = _batch;
        p.composition = _composition;
        p.typeOfProduct = _typeOfProduct;
        p.price = _price;
        p.manufacturer = payable(msg.sender);
        p.currentHolder = msg.sender;
        p.ipfsHash = _ipfsHash;
        p.status = "Manufactured";
        p.history = new address[](0);  // Initialize array
        p.history.push(msg.sender);    // Then push
        p.sold = false;

        exists[_id] = true;
        allProductIds.push(_id);

        emit ProductCreated(_id, _name, msg.sender);
        return _id;
    }

    function getProduct(string memory _id)
        public
        view
        productExists(_id)
        returns (Product memory)
    {
        return products[_id];
    }
}