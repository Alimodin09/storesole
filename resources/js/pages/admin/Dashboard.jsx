import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import api from '../../utils/api.js';

function formatPeso(value) {
	return `₱${Number(value || 0).toFixed(2)}`;
}

function getBadgeClass(status) {
	const map = {
		Pending: 'badge-pending',
		Processing: 'badge-processing',
		'Ready for Pickup': 'badge-shipped',
		Delivered: 'badge-shipped',
		Completed: 'badge-completed',
	};

	return map[status] || 'badge-pending';
}

export default function Dashboard() {
	const navigate = useNavigate();
	const [orders, setOrders] = useState([]);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let active = true;

		const fetchDashboardData = async () => {
			setLoading(true);
			setErrorMessage('');

			try {
				const [{ data: orderData }, { data: productData }] = await Promise.all([
					api.get('/orders'),
					api.get('/products'),
				]);

				if (!active) {
					return;
				}

				setOrders(Array.isArray(orderData) ? orderData : []);
				setProducts(Array.isArray(productData) ? productData : []);
			} catch (error) {
				if (active) {
					setErrorMessage(error?.response?.data?.message || 'Failed to load dashboard data.');
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		fetchDashboardData();

		return () => {
			active = false;
		};
	}, []);

	const metrics = useMemo(() => {
		const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
		const totalOrders = orders.length;
		const totalProducts = products.length;
		const uniqueCustomers = new Set(
			orders
				.map((order) => order.user?.id)
				.filter(Boolean)
		).size;

		return [
			{ label: 'Gross Sales', value: formatPeso(totalSales), color: 'primary' },
			{ label: 'Total Orders', value: String(totalOrders), color: 'success' },
			{ label: 'Products', value: String(totalProducts), color: 'warning' },
			{ label: 'Customers', value: String(uniqueCustomers), color: 'info' },
		];
	}, [orders, products]);

	const recentOrders = useMemo(() => {
		return [...orders]
			.sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
			.slice(0, 6);
	}, [orders]);

	const handleAddProduct = () => {
		navigate('/admin/products/create');
	};

	const handleManageOrder = (orderId) => {
		navigate(`/admin/orders?orderId=${orderId}`);
	};

	const handleExportReport = async () => {
		try {
			const response = await api.get('/reports/sales', { responseType: 'blob' });
			const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			alert(error?.response?.data?.message || 'Failed to export sales report.');
		}
	};

	return (
		<section className="page page--dashboard">
			<div className="dashboard-header">
				<div>
					<h1>Admin Dashboard</h1>
					<p>Monitor sales, inventory, and customer activity</p>
				</div>
				<div className="dashboard-actions">
					<button className="btn-small" onClick={handleExportReport} title="Export sales report to CSV">
						Export Report
					</button>
					<button className="btn-small btn-small--primary" onClick={handleAddProduct} title="Create a new product">
					<FiPlus /> Add Product
					</button>
				</div>
			</div>

			{errorMessage && <div className="alert alert-error">{errorMessage}</div>}

			<div className="stats-grid">
				{metrics.map((stat) => (
					<div key={stat.label} className={`stat-card stat-${stat.color}`}>
						<h4>{stat.label}</h4>
						<p className="stat-value">{stat.value}</p>
					</div>
				))}
			</div>

			<div className="recent-orders-section">
				<h2>Recent Orders</h2>
				{loading ? (
					<div className="loading">Loading recent orders...</div>
				) : recentOrders.length === 0 ? (
					<div className="empty-state">
						<p>No orders yet. When customers place orders, they'll appear here.</p>
					</div>
				) : (
					<div className="orders-table">
						<table>
							<thead>
								<tr>
									<th>Order ID</th>
									<th>Customer</th>
									<th>Amount</th>
									<th>Status</th>
									<th>Date</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{recentOrders.map((order) => (
									<tr key={order.id}>
										<td className="order-id"><strong>ORD-{String(order.id).padStart(3, '0')}</strong></td>
										<td>{order.user?.name || 'Guest'}</td>
										<td><strong>{formatPeso(order.total)}</strong></td>
										<td>
											<span className={`badge ${getBadgeClass(order.status)}`}>
												{order.status}
											</span>
										</td>
										<td>{new Date(order.created_at).toLocaleDateString()}</td>
										<td>
											<button 
												className="btn-action" 
												onClick={() => handleManageOrder(order.id)}
												title={`View details for order ${order.id}`}
											>
												View
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);

}

