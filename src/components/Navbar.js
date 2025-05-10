import React, { Component } from 'react';
import Web3 from 'web3';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balances: {}
    };
  }

  componentDidMount() {
    this.fetchBalances();
  }

  componentDidUpdate(prevProps) {
    // Refetch balances when accounts change or when selected account changes
    if (prevProps.availableAccounts !== this.props.availableAccounts || 
        prevProps.account !== this.props.account) {
      this.fetchBalances();
    }
  }

  fetchBalances = async () => {
    const { availableAccounts } = this.props;
    const web3 = window.web3;
    
    if (!web3 || !availableAccounts || availableAccounts.length === 0) return;
    
    const balances = {};
    
    // Fetch balance for each account
    for (const account of availableAccounts) {
      try {
        const balanceWei = await web3.eth.getBalance(account);
        // Convert Wei to ETH and limit to 4 decimals
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        balances[account] = parseFloat(balanceEth).toFixed(4);
      } catch (error) {
        console.error(`Error fetching balance for ${account}:`, error);
        balances[account] = '?';
      }
    }
    
    this.setState({ balances });
  }

  handleAccountChange = (event) => {
    const selectedAccount = event.target.value;
    this.props.onAccountChange(selectedAccount);
  };

  render() {
    const { account, availableAccounts } = this.props;
    const { balances } = this.state;
    
    return (
      <nav className="navbar navbar-dark bg-dark py-1">
        <div className="container-fluid">
          {/* Left - Brand */}
          <span className="navbar-brand h6 mb-0">
            Supply Chain
          </span>
          
          {/* Center - Account Dropdown */}
          <div className="position-relative start-100 translate-middle-x">
            <select 
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={account}
              onChange={this.handleAccountChange}
              style={{ 
                width: '280px',
                fontSize: '0.875rem'
              }}
            >
              {availableAccounts.map(acc => (
                <option key={acc} value={acc}>
                  {acc.substring(0, 6)}...{acc.substring(acc.length - 4)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Right - Balance */}
          {account && balances[account] && (
            <div className="ms-auto">
              <span className="badge bg-success text-white">
                Balance: {balances[account]} ETH
              </span>
            </div>
          )}
        </div>
      </nav>
    );
  }
}

export default Navbar;