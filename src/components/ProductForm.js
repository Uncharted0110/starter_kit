import React, { Component } from 'react';

class ProductForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            name: '',
            batch: '',
            price: '',
            status: '',
            ipfsHash: ''
        };
    }

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const { id, name, batch, price, status, ipfsHash } = this.state;

        // Simple validation
        if (!id || !name || !batch || !price) {
            alert('Please fill in all required fields');
            return;
        }

        // Convert price to wei
        const priceInWei = window.web3.utils.toWei(price, 'ether');

        this.props.addProduct(id, name, batch, priceInWei, status, ipfsHash);

        // Reset form
        this.setState({
            id: '',
            name: '',
            batch: '',
            price: '',
            status: '',
            ipfsHash: ''
        });
    }

    render() {
        return (
            <div className="card mb-4">
                <div className="card-header">
                    <h4>Add New Product</h4>
                </div>
                <div className="card-body">
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group row mb-3">
                            <label className="col-sm-2 col-form-label">Product ID:</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    name="id"
                                    className="form-control"
                                    placeholder="Unique ID"
                                    value={this.state.id}
                                    onChange={this.handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group row mb-3">
                            <label className="col-sm-2 col-form-label">Name:</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Product Name"
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group row mb-3">
                            <label className="col-sm-2 col-form-label">Batch:</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    name="batch"
                                    className="form-control"
                                    placeholder="Batch Number"
                                    value={this.state.batch}
                                    onChange={this.handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group row mb-3">
                            <label className="col-sm-2 col-form-label">Price (ETH):</label>
                            <div className="col-sm-10">
                                <input
                                    type="number"
                                    step="0.001"
                                    name="price"
                                    className="form-control"
                                    placeholder="0.0"
                                    value={this.state.price}
                                    onChange={this.handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group row mb-3">
                            <label className="col-sm-2 col-form-label">Status:</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    name="status"
                                    className="form-control"
                                    placeholder="e.g., Manufactured"
                                    value={this.state.status}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>



                        <div className="form-group row">
                            <div className="col-sm-10 offset-sm-2">
                                <button type="submit" className="btn btn-primary">Add Product</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

export default ProductForm;