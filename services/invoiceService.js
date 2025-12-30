// lib/services/invoiceService.js (or wherever you store this file)

import { deleteData, getData, postData, putData } from "@/lib/axios";

class InvoiceService {
  // =================================================================
  // == User-Facing Methods
  // =================================================================

  /**
   * Get all invoices for the currently authenticated user.
   * @returns {Promise<Array>} A list of the user's invoices.
   */
  async getMyInvoices() {
    return await getData("/invoices/me", true);
  }

  /**
   * Get an analytics summary for the currently authenticated user.
   * Includes counts and total amounts for paid, pending, and failed invoices.
   * @returns {Promise<Object>} The user's invoice summary data.
   */
  async getMyInvoiceSummary() {
    // This correctly calls the new user summary endpoint.
    return await getData("/invoices/me/summary", true);
  }

  /**
   * Get a single invoice by its ID.
   * The backend ensures the user can only access their own invoice.
   * @param {number | string} invoiceId - The ID of the invoice to fetch.
   * @returns {Promise<Object>} The invoice details.
   */
  async getInvoiceById(invoiceId) {
    return await getData(`/invoices/${invoiceId}`, true);
  }

  /**
   * Create a new invoice and its associated payment link.
   * @param {Object} data - The invoice creation payload.
   * @returns {Promise<Object>} The newly created invoice response with a pay_url.
   */
  async createInvoice(data) {
    return await postData("/invoices/", data, true); // Added trailing slash to match backend
  }

  async getUserLastInvoice() {
    return await getData("/invoices/me/last", true);
  }

  async getInvoiceByReference(customerReference) {
    return await getData(`/invoices/by-reference/${customerReference}`, true);
  }

  // NOTE: User-facing update/cancel methods have been removed.
  // In this business logic, once an invoice is created, it cannot be modified or
  // cancelled by the user directly via the API. Status changes (e.g., to FAILED
  // or PAID) are handled by the payment provider or admins.

  // =================================================================
  // == Admin-Only Methods
  // =================================================================

  /**
   * [ADMIN] Get an analytics summary of ALL invoices in the system.
   * @returns {Promise<Object>} The global invoice summary data.
   */
  async getInvoiceSummaryAdmin() {
    // This correctly calls the new global admin summary endpoint.
    return await getData("/invoices/admin/summary", true);
  }

  /**
   * [ADMIN] Get a paginated list of all invoices in the system.
   * Can be filtered by a search term.
   * @param {Object} params - The query parameters.
   * @param {number} [params.page=1] - The page number to fetch.
   * @param {number} [params.per_page=10] - The number of items per page.
   * @param {string|null} [params.search=null] - A search term for customer reference.
   * @returns {Promise<Array>} A list of all invoices.
   */
  async getAllInvoicesAdmin({ page = 1, per_page = 10, search = null }) {
    // Backend uses skip/limit, so we convert page/per_page for convenience.
    const limit = per_page;
    const skip = (page - 1) * per_page;

    let url = `/invoices/admin/all?skip=${skip}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return await getData(url, true);
  }

  /**
   * [ADMIN] Get a single invoice by its ID.
   * @param {number | string} invoiceId - The ID of the invoice to fetch.
   * @returns {Promise<Object>} The invoice details.
   */
  async getInvoiceByIdAdmin(invoiceId) {
    return await getData(`/invoices/${invoiceId}/admin`, true);
  }

  // NOTE: Admin update/delete methods have been removed as they are not defined
  // in the provided backend router. If you add endpoints for these actions
  // in the future, you can add the corresponding service methods here.

  // NOTE: Webhook-related methods have been removed.
  // These actions (markAsPaid, markAsFailed) are initiated by the payment provider
  // calling your backend webhook, not by the frontend client. They do not belong in a
  // frontend service.

  async updateInvoiceAdmin(invoiceId, data) {
    // This calls the new PATCH endpoint
    return await putData(`/invoices/admin/${invoiceId}`, data, true);
  }

  async updateInvoicePickedUp(invoiceId, picked_up) {
    // This calls the new PATCH endpoint
    return await getData(
      `/invoices/invoice/picked-up?invoice_id=${invoiceId}&picked_up=${picked_up}`,
      true
    );
  }

  /**
   * [ADMIN] Permanently delete an invoice.
   * @param {number | string} invoiceId - The ID of the invoice to delete.
   * @returns {Promise<void>}
   */
  async deleteInvoiceAdmin(invoiceId) {
    // This calls the new DELETE endpoint
    return await deleteData(`/invoices/admin/${invoiceId}`, true);
  }

  /**
   * [ADMIN] Get comprehensive invoice analytics with all breakdowns.
   * Includes status counts, revenue metrics, activity breakdown, payment method breakdown,
   * invoice type breakdown, confirmation tracking, and pickup tracking.
   * @returns {Promise<Object>} Detailed invoice summary with all analytics.
   */
  async getDetailedSummaryAdmin() {
    return await getData("/invoices/admin/detailed-summary", true);
  }

  /**
   * [ADMIN] Get invoice analytics filtered by specific month.
   * @param {number} year - Year (e.g., 2025)
   * @param {number} month - Month number (1-12)
   * @returns {Promise<Object>} Monthly invoice analytics with all breakdowns.
   */
  async getMonthlyAnalytics(year, month) {
    return await getData(
      `/invoices/admin/monthly-analytics?year=${year}&month=${month}`,
      true
    );
  }

  /**
   * [ADMIN] Get top customers ranked by total spending.
   * @param {number} [limit=10] - Number of customers to return (default: 10, max: 100)
   * @returns {Promise<Array>} List of top customers with spending details.
   */
  async getTopCustomers(limit = 10) {
    return await getData(
      `/invoices/admin/top-customers?limit=${limit}`,
      true
    );
  }
}

export default new InvoiceService();
