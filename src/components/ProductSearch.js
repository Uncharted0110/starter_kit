import React, { Component } from 'react';

class ProductSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchId: '',
            product: null,
            error: null,
            loading: false
        };
    }

    handleSearch = async (e) => {
        e.preventDefault();
        this.setState({ loading: true, error: null, product: null });

        try {
            if (!this.props.contract) {
                throw new Error('Contract not initialized');
            }

            const product = await this.props.getProduct(this.state.searchId);

            if (!product) {
                throw new Error('Product not found');
            }

            this.setState({
                product,
                loading: false
            });

            if (this.props.onProductFound) {
                this.props.onProductFound(product);
            }
        } catch (error) {
            console.error('Error searching product:', error);
            this.setState({
                error: error.message || 'Failed to fetch product. Please check the ID and try again.',
                loading: false
            });
        }
    }

    render() {
        return (
            <div className="card mb-4">
                <div className="card-header">
                    <h4>Search Product</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={this.handleSearch}>
                        <div className="form-group row mb-3">
                            <div className="col-sm-8">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Product ID"
                                    value={this.state.searchId}
                                    onChange={(e) => this.setState({ searchId: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-sm-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={this.state.loading}
                                >
                                    {this.state.loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {this.state.error && (
                        <div className="alert alert-danger mt-3">{this.state.error}</div>
                    )}

                    {this.state.product && (
                        <div className="mt-3">
                            <h5>Product Details</h5>
                            <table className="table">
                                <tbody>
                                    <tr><td>ID:</td><td>{this.state.product.id}</td></tr>
                                    <tr><td>Name:</td><td>{this.state.product.name}</td></tr>
                                    <tr><td>Batch:</td><td>{this.state.product.batch}</td></tr>
                                    <tr>
                                        <td>Price:</td>
                                        <td>
                                            {window.web3.utils.fromWei(
                                                this.state.product.price.toString(),
                                                'ether'
                                            )} ETH
                                        </td>
                                    </tr>
                                    <tr><td>Status:</td><td>{this.state.product.status}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    componentWillUnmount() {
        // Clean up any pending state updates
        this.setState = () => {
            return;
        };
    }
}

export default ProductSearch;