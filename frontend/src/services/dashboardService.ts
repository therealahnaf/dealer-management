import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface DashboardStats {
    total_orders: number;
    pending_orders: number;
    total_invoices: number;
    outstanding_amount: number;
    total_dealers: number;
    recent_orders: any[];
    top_products: { name: string; value: number }[];
    monthly_revenue: { name: string; total: number }[];
    dealer_stats: { name: string; value: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
