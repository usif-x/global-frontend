import { getData } from "@/lib/axios";

class AnalyticsService {
  static async getAll() {
    return await getData("/analytics/all");
  }

  /**
   * Get total invoice revenue from paid invoices.
   * @returns {Promise<Object>} Object with total_revenue and currency.
   */
  static async getInvoiceRevenue() {
    return await getData("/analytics/invoices/revenue");
  }

  /**
   * Get confirmation statistics for invoices.
   * @returns {Promise<Object>} Object with confirmed_count, unconfirmed_count, total_count, and confirmation_rate.
   */
  static async getConfirmedStats() {
    return await getData("/analytics/invoices/confirmed");
  }

  /**
   * Get pickup statistics for invoices.
   * @returns {Promise<Object>} Object with picked_up_count, not_picked_up_count, total_count, and pickup_rate.
   */
  static async getPickupStats() {
    return await getData("/analytics/invoices/pickup");
  }

  /**
   * Get consolidated dashboard summary.
   * @param {number} [month] - Optional month (1-12)
   * @param {number} [year] - Optional year
   * @returns {Promise<Object>} Object with stats, charts, top_customers, and recent_transactions.
   */
  static async getDashboardSummary(month, year) {
    let url = "/analytics/dashboard";
    const params = [];
    if (month) params.push(`month=${month}`);
    if (year) params.push(`year=${year}`);
    
    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }
    
    return await getData(url);
  }
}

export default AnalyticsService;
