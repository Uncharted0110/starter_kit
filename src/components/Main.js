import React, { Component } from 'react';
import ProductForm from './ProductForm';
import ProductActions from './ProductActions';
import ProductSearch from './ProductSearch';

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'add',
            currentProduct: null
        };
    }

    setActiveTab = (tab) => {
        this.setState({ activeTab: tab });
    }

    handleProductFound = (product) => {
        if (!product) {
            return;
        }

        // Ensure all required properties exist
        const validProduct = {
            ...product,
            history: product.history || [],
            currentHolder: product.currentHolder || product.holder || '', // Fallback for backward compatibility
            manufacturer: product.manufacturer || '',
            sold: product.sold || false
        };

        this.setState({
            currentProduct: validProduct,
            activeTab: 'actions'
        });
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${this.state.activeTab === 'add' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.setActiveTab('add');
                                    }}
                                >
                                    Add Product
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${this.state.activeTab === 'search' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        this.setActiveTab('search');
                                    }}
                                >
                                    Search Product
                                </a>
                            </li>
                            {this.state.currentProduct && (
                                <li className="nav-item">
                                    <a
                                        className={`nav-link ${this.state.activeTab === 'actions' ? 'active' : ''}`}
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            this.setActiveTab('actions');
                                        }}
                                    >
                                        Product Actions
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="mt-4">
                    {this.state.activeTab === 'add' && (
                        <ProductForm addProduct={this.props.addProduct} />
                    )}

                    {this.state.activeTab === 'search' && (
                        <ProductSearch
                            contract={this.props.contract}
                            getProduct={async (id) => {
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
                                        price: result[4],
                                        status: result[5],
                                        ipfsHash: result[6],
                                        history: result[7],
                                        sold: result[8]
                                    };
                                    if (this.props.onProductFound) {
                                        this.props.onProductFound(product);
                                    }
                                    return product;
                                }
                                return null;
                            }}
                            onProductFound={this.handleProductFound}
                        />
                    )}

                    {this.state.activeTab === 'actions' && this.state.currentProduct && (
                        <ProductActions
                            account={this.props.account}
                            product={this.state.currentProduct}
                            purchaseProduct={this.props.purchaseProduct}
                            transferProduct={this.props.transferProduct}
                            updateStatus={this.props.updateStatus}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default Main;