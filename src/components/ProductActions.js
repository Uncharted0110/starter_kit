import React, { Component } from 'react';

class ProductActions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newStatus: '',
            transferAddress: '',
            isOwner: false,
            transferLoading: false,
            statusLoading: false,
            error: null
        };
    }

    componentDidMount() {
        this.checkOwnership();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.product.id !== this.props.product.id) {
            this.checkOwnership();
        }
    }

    checkOwnership = () => {
        const { account, product } = this.props;
        const isOwner = account.toLowerCase() === product.currentHolder.toLowerCase();
        this.setState({ isOwner });
    }

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    handlePurchase = (event) => {
        event.preventDefault();
        const { product } = this.props;
        this.props.purchaseProduct(product.id, product.priceInWei);
    }

    handleTransfer = async (event) => {
    event.preventDefault();
    const { transferAddress } = this.state;
    const { product } = this.props;

    if (!window.web3.utils.isAddress(transferAddress)) {
        this.setState({ error: 'Please enter a valid Ethereum address' });
        return;
    }

    this.setState({ transferLoading: true, error: null });
    try {
        // Wait for transaction to be mined
        const tx = await this.props.transferProduct(product.id, transferAddress);
        await window.web3.eth.getTransactionReceipt(tx.transactionHash);
        
        // Reset form and loading state
        this.setState({
            transferAddress: '',
            transferLoading: false,
            error: null
        });
        
        // Reload product data
        window.location.reload();
    } catch (error) {
        console.error('Transfer error:', error);
        this.setState({
            error: 'Failed to transfer product. Please try again.',
            transferLoading: false
        });
    }
}

handleUpdateStatus = async (event) => {
    event.preventDefault();
    const { newStatus } = this.state;
    const { product } = this.props;

    if (!newStatus) {
        this.setState({ error: 'Please enter a new status' });
        return;
    }

    this.setState({ statusLoading: true, error: null });
    try {
        // Wait for transaction to be mined
        const tx = await this.props.updateStatus(product.id, newStatus);
        await window.web3.eth.getTransactionReceipt(tx.transactionHash);
        
        // Reset form and loading state
        this.setState({
            newStatus: '',
            statusLoading: false,
            error: null
        });
        
        // Reload product data
        window.location.reload();
    } catch (error) {
        console.error('Status update error:', error);
        this.setState({
            error: 'Failed to update status. Please try again.',
            statusLoading: false
        });
    }
}

    render() {
        const { product, account } = this.props;
        const { isOwner } = this.state;
        const isManufacturer = account.toLowerCase() === product.manufacturer.toLowerCase();

        return (
            <div className="card mb-4">
                <div className="card-header">
                    <h4>Product Details: {product.name}</h4>
                </div>
                <div className="card-body">
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h5>Basic Information</h5>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>ID</th>
                                        <td>{product.id}</td>
                                    </tr>
                                    <tr>
                                        <th>Name</th>
                                        <td>{product.name}</td>
                                    </tr>
                                    <tr>
                                        <th>Batch</th>
                                        <td>{product.batch}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>{product.status}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <h5>Ownership Information</h5>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Manufacturer</th>
                                        <td className="text-break">{product.manufacturer}</td>
                                    </tr>
                                    <tr>
                                        <th>Current Holder</th>
                                        <td className="text-break">{product.currentHolder}</td>
                                    </tr>
                                    <tr>
                                        <th>Sold</th>
                                        <td>{product.sold ? 'Yes' : 'No'}</td>
                                    </tr>
                                    <tr>
                                        <th>IPFS Documents</th>
                                        <td>
                                            {product.ipfsHash ? (
                                                <a
                                                    href={`https://ipfs.io/ipfs/${product.ipfsHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Documents
                                                </a>
                                            ) : (
                                                'No documents attached'
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <h5>Ownership History</h5>
                            {Array.isArray(product.history) && product.history.length > 0 ? (
                                <ul className="list-group">
                                    {product.history.map((address, index) => (
                                        <li key={index} className="list-group-item text-break">
                                            {index + 1}. {address}
                                            {address.toLowerCase() === product.manufacturer.toLowerCase() && ' (Manufacturer)'}
                                            {address.toLowerCase() === product.currentHolder.toLowerCase() && ' (Current Holder)'}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">No ownership history available</p>
                            )}
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col-md-12">
                            <h5>Actions</h5>
                            <div className="card-deck">
                                {/* Purchase form */}
                                {!isOwner && !product.sold && (
                                    <div className="card mb-3">
                                        <div className="card-body">
                                            <h6 className="card-title">Purchase Product</h6>
                                        </div>
                                    </div>
                                )}

                                {/* Transfer form - only shown to current owner */}
                                {isOwner && (
                                    <div className="card mb-3">
                                        <div className="card-body">
                                            <h6 className="card-title">Transfer Ownership</h6>
                                            <form onSubmit={this.handleTransfer}>
                                                <div className="form-group mb-3">
                                                    <input
                                                        type="text"
                                                        name="transferAddress"
                                                        className="form-control"
                                                        placeholder="Recipient Address"
                                                        value={this.state.transferAddress}
                                                        onChange={this.handleChange}
                                                        disabled={this.state.transferLoading}
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn btn-warning"
                                                    disabled={this.state.transferLoading}
                                                >
                                                    {this.state.transferLoading ? 'Transferring...' : 'Transfer'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {/* Update status form */}
                                {isOwner && (
                                    <div className="card mb-3">
                                        <div className="card-body">
                                            <h6 className="card-title">Update Status</h6>
                                            <form onSubmit={this.handleUpdateStatus}>
                                                <div className="form-group mb-3">
                                                    <input
                                                        type="text"
                                                        name="newStatus"
                                                        className="form-control"
                                                        placeholder="New Status"
                                                        value={this.state.newStatus}
                                                        onChange={this.handleChange}
                                                        disabled={this.state.statusLoading}
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="btn btn-info"
                                                    disabled={this.state.statusLoading}
                                                >
                                                    {this.state.statusLoading ? 'Updating...' : 'Update'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProductActions;