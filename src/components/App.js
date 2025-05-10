import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import SupplyChainTracker from './SupplyChainTracker.json';
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      availableAccounts: [], // Add this line
      supplyChainTracker: null,
      products: [],
      loading: true
    };

    this.addProduct = this.addProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
    this.transferProduct = this.transferProduct.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  handleAccountChange = async (selectedAccount) => {
    try {
      // Update state with new account
      this.setState({
        account: selectedAccount,
        loading: true
      }, async () => {
        // Reload blockchain data with new account
        await this.loadBlockchainData();
      });

      console.log(`Switched to account: ${selectedAccount}`);
    } catch (error) {
      console.error('Error switching account:', error);
      alert('Could not switch account. Please try again.');
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    try {
      // Load account
      const accounts = await web3.eth.getAccounts();
      console.log('Available accounts:', accounts); 

      const activeAccount = this.state.account || accounts[0];

      this.setState({
      account: activeAccount,
      availableAccounts: accounts
    });

      // Get the network ID
      const networkId = await web3.eth.net.getId();
      console.log('Connected to network ID:', networkId);

      // Check if we have contract data for this network
      if (SupplyChainTracker.networks) {
        console.log('Available networks in contract:', Object.keys(SupplyChainTracker.networks));
      } else {
        console.log('No networks found in contract JSON');
      }

      const networkData = SupplyChainTracker.networks[networkId];
      console.log('Network data:', networkData);

      if (networkData) {
        console.log('Contract address:', networkData.address);
        const supplyChainTracker = new web3.eth.Contract(
          SupplyChainTracker.abi,
          networkData.address
        );
        this.setState({ supplyChainTracker });

        // Load products (in a real app, you'd need a way to list available products)
        // This is just a placeholder as the contract doesn't have a getter for all products

        this.setState({ loading: false });
      } else {
        const networkName = {
          1: 'Mainnet',
          3: 'Ropsten',
          4: 'Rinkeby',
          5: 'Goerli',
          42: 'Kovan',
          56: 'BSC',
          97: 'BSC Testnet',
          137: 'Polygon',
          80001: 'Mumbai',
          31337: 'Hardhat',
          1337: 'Ganache'
        }[networkId] || `Network ID ${networkId}`;

        window.alert(`SupplyChainTracker contract not deployed to detected network (${networkName}).`);
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      window.alert(`Error connecting to blockchain: ${error.message}`);
    }
  }

  getProduct = async (id) => {
    if (!this.props.contract) {
      throw new Error('Contract not initialized');
    }
    const result = await this.props.contract.methods.getProduct(id).call();
    if (result) {
      const product = {
        id: id,
        name: result[0],
        batch: result[1],
        manufacturer: result[2],
        holder: result[3],
        price: result[4].toString(), // Convert BN to string
        status: result[5],
        ipfsHash: result[6],
        history: Array.isArray(result[7]) ? result[7] : [],
        sold: result[8]
      };
      return product;
    }
    return null;
  }

  async addProduct(id, name, batch, price, status, ipfsHash) {
    this.setState({ loading: true, error: null });
    try {
      console.log('Sending transaction with params:', { id, name, batch, price, status, ipfsHash });
      console.log('Using account:', this.state.account);

      // First estimate gas to see if the transaction will fail
      const gasEstimate = await this.state.supplyChainTracker.methods
        .addProduct(id, name, batch, price, status, ipfsHash)
        .estimateGas({ from: this.state.account });

      console.log('Gas estimate:', gasEstimate);

      // Add 30% buffer to gas estimate
      const gasLimit = Math.floor(gasEstimate * 1.3);
      console.log('Using gas limit:', gasLimit);

      // Create transaction object
      const transactionParameters = {
        from: this.state.account,
        gas: gasLimit,
        gasPrice: await window.web3.eth.getGasPrice() // Get current gas price
      };

      console.log('Transaction parameters:', transactionParameters);

      // Add transaction timeout for better UX
      let txPromise = this.state.supplyChainTracker.methods
        .addProduct(id, name, batch, price, status, ipfsHash)
        .send(transactionParameters);

      // Log when MetaMask popup appears
      console.log('Waiting for user to confirm in MetaMask...');

      // Add event listeners to track transaction progress
      txPromise.on('transactionHash', (hash) => {
        console.log('Transaction submitted, hash:', hash);
        // You could update UI here to show "Transaction Submitted" instead of just "Loading"
        this.setState({ transactionHash: hash });
      });

      txPromise.on('receipt', (receipt) => {
        console.log('Transaction receipt received:', receipt);
      });

      txPromise.on('confirmation', (confirmationNumber, receipt) => {
        console.log(`Confirmation ${confirmationNumber}:`, receipt);
        // After first confirmation, we can consider it done
        if (confirmationNumber === 1) {
          this.setState({
            loading: false,
            transactionHash: null
          });
          alert(`Product added successfully! Transaction hash: ${receipt.transactionHash}`);
        }
      });

      txPromise.on('error', (error) => {
        console.error('Transaction error event:', error);
        this.setState({
          loading: false,
          error: `Transaction failed: ${error.message}`
        });
      });

      // Set a timeout in case transaction takes too long
      const timeout = setTimeout(() => {
        console.log('Transaction is taking a long time. It may still complete.');
        this.setState({
          loading: false,
          error: 'Transaction is taking longer than expected. Check MetaMask or your transaction history to see if it completed.'
        });
      }, 60000); // 60 seconds timeout

      // Wait for transaction to complete
      const tx = await txPromise;

      // Clear timeout since transaction completed
      clearTimeout(timeout);

      console.log('Transaction successful:', tx);

      // Set loading to false
      this.setState({ loading: false });

      // Show success message to user
      alert(`Product added successfully! Transaction hash: ${tx.transactionHash}`);

      return true;
    } catch (error) {
      console.error('Detailed error adding product:', error);

      // Handle specific MetaMask errors
      let errorMessage = 'Error adding product';

      if (error.code) {
        // MetaMask error codes
        switch (error.code) {
          case 4001:
            errorMessage = 'Transaction rejected by user';
            break;
          case -32603:
            errorMessage = 'Internal JSON-RPC error. The transaction might have failed. Check if your product ID is already in use.';
            break;
          case -32002:
            errorMessage = 'MetaMask is already processing a request. Please wait.';
            break;
          default:
            errorMessage = `MetaMask error (${error.code}): ${error.message}`;
        }
      } else if (error.message) {
        errorMessage = error.message;

        // Check for common error patterns
        if (error.message.includes('execution reverted')) {
          errorMessage = 'Transaction failed: Contract execution reverted. This often means the product ID already exists.';
        }
      }

      this.setState({
        loading: false,
        error: errorMessage
      });

      // Show error in alert for visibility
      alert(errorMessage);

      return false;
    }
  }

  async purchaseProduct(id, price) {
    this.setState({ loading: true });
    try {
      await this.state.supplyChainTracker.methods
        .purchaseProduct(id)
        .send({ from: this.state.account, value: price });

      // Refresh products after purchase
      this.loadBlockchainData();
    } catch (error) {
      console.error('Error purchasing product:', error);
      this.setState({ loading: false });
    }
  }

  async transferProduct(id, to) {
    this.setState({ loading: true });
    try {
      await this.state.supplyChainTracker.methods
        .transferProduct(id, to)
        .send({ from: this.state.account });

      // Refresh products after transfer
      this.loadBlockchainData();
    } catch (error) {
      console.error('Error transferring product:', error);
      this.setState({ loading: false });
    }
  }

  async updateStatus(id, status) {
    this.setState({ loading: true });
    try {
      await this.state.supplyChainTracker.methods
        .updateStatus(id, status)
        .send({ from: this.state.account });

      // Refresh products after status update
      this.loadBlockchainData();
    } catch (error) {
      console.error('Error updating product status:', error);
      this.setState({ loading: false });
    }
  }

  async getProduct(id) {
    try {
      const product = await this.state.supplyChainTracker.methods.getProduct(id).call();
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Replace your current render method with this one
  render() {
    return (
      <div>
        <Navbar
          account={this.state.account}
          availableAccounts={this.state.availableAccounts}
          onAccountChange={this.handleAccountChange}
        />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {this.state.loading ? (
                <div id="loader" className="text-center w-100">
                  <p className="text-center">Loading...</p>
                  {this.state.transactionHash && (
                    <div>
                      <p>Transaction submitted! Waiting for confirmation...</p>
                      <p className="text-break small">
                        <a
                          href={`https://etherscan.io/tx/${this.state.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {this.state.transactionHash}
                        </a>
                      </p>
                      <button
                        className="btn btn-warning mt-3"
                        onClick={() => this.setState({ loading: false })}
                      >
                        Continue without waiting
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {this.state.error && (
                    <div className="alert alert-danger w-100" role="alert">
                      <strong>Error: </strong>{this.state.error}
                      <button
                        className="btn btn-sm btn-outline-danger float-right"
                        onClick={() => this.setState({ error: null })}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  <Main
                    account={this.state.account}
                    addProduct={this.addProduct}
                    purchaseProduct={this.purchaseProduct}
                    transferProduct={this.transferProduct}
                    updateStatus={this.updateStatus}
                    getProduct={this.getProduct}
                    contract={this.state.supplyChainTracker}  // Add this line
                  />
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }
}
export default App;