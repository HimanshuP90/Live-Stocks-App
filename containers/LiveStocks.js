import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { addStocks, setSelectedStock } from '../actions/stocks'
import { addPrice } from '../actions/price'
import StockTable from '../components/StockTable'
import StockChart from '../components/StockChart'
import styles from '../styles/layout.scss'

class LiveStocks extends Component {
	constructor(props) {
		super(props)
		this.state = {}
	}
	static async getInitialProps({ store, query }) {}

	componentDidMount() {
		const { addStocks, addPrice, selectedStock, setSelectedStock } = this.props
		// Create WebSocket connection.
		this.socket = new WebSocket('ws://stocks.mnet.website')

		// Connection opened
		this.socket.addEventListener('open', event => {
			this.socket.send('Web Socket connection now opend !!')
		})

		// Listen for messages
		this.socket.addEventListener('message', event => {
			let data
			try {
				data = JSON.parse(event.data)
			} catch (e) {
				data = []
			}
			if (!this.props.selectedStock) {
				setSelectedStock(data[0] && data[0][0])
			}
			let price = {}
			const stocks = data.reduce((acc, s, i) => {
				acc[s[0]] = {
					name: s[0].toUpperCase(),
					price: s[1]
				}
				price[s[0]] = s[1]
				return acc
			}, {})
			addStocks(stocks)
			addPrice(price)
		})
	}

	componentWillUnmount() {
		this.socket.close()
	}

	render() {
		const { stocks, price, selectedStock, setSelectedStock } = this.props
		return (
			<Fragment>
				<div className="layout">
					<StockTable
						stocks={stocks}
						price={price}
						selectedStock={selectedStock}
						setStock={stock => setSelectedStock(stock)}
					/>
					<StockChart
						stocks={stocks}
						price={price}
						selectedStock={selectedStock}
					/>
				</div>
				<style jsx>{styles}</style>
			</Fragment>
		)
	}
}

function mapStateToProps({ stocks, price, selectedStock }) {
	return { stocks, price, selectedStock }
}

LiveStocks.propTypes = {}

export default connect(
	mapStateToProps,
	{ addStocks, addPrice, setSelectedStock }
)(LiveStocks)
