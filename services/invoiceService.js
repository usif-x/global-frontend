import { deleteData, getData, patchData, postData } from "@/lib/axios";

class InvoiceService {
  // Get current user's invoices (with optional pagination & status)
  async getMyInvoices({ page = 1, per_page = 10, status = null }) {
    let url = `/invoices/my?page=${page}&per_page=${per_page}`;
    if (status) url += `&status=${status}`;
    return await getData(url, true);
  }

  // Get current user's invoice summary
  async getMyInvoiceSummary() {
    return await getData("/invoices/my/summary", true);
  }

  // Get single invoice by ID (if owned by current user)
  async getInvoiceById(invoiceId) {
    return await getData(`/invoices/${invoiceId}`, true);
  }

  // Create a new invoice
  async createInvoice(data) {
    return await postData("/invoices", data, true);
  }

  // Update an invoice (if not paid)
  async updateInvoice(invoiceId, data) {
    return await patchData(`/invoices/${invoiceId}`, data, true);
  }

  // Cancel an invoice (status update)
  async cancelInvoice(invoiceId) {
    return await putData(
      `/invoices/${invoiceId}/status`,
      {
        status: "CANCELLED",
      },
      true
    );
  }

  // ADMIN: Get all invoices
  async getAllInvoicesAdmin({ page = 1, per_page = 10, status = null }) {
    let url = `/invoices/admin/all?page=${page}&per_page=${per_page}`;
    if (status) url += `&status=${status}`;
    return await getData(url, true);
  }

  // ADMIN: Get user-specific invoices
  async getUserInvoicesAdmin(
    userId,
    { page = 1, per_page = 10, status = null }
  ) {
    let url = `/invoices/admin/user/${userId}?page=${page}&per_page=${per_page}`;
    if (status) url += `&status=${status}`;
    return await getData(url, true);
  }

  // ADMIN: Update any invoice
  async updateInvoiceAdmin(invoiceId, data) {
    return await patchData(`/invoices/admin/${invoiceId}`, data, true);
  }

  // ADMIN: Update invoice status
  async updateInvoiceStatusAdmin(invoiceId, status) {
    return await patchData(
      `/invoices/admin/${invoiceId}/status`,
      {
        status: status.toLowerCase(),
      },
      true
    );
  }

  // ADMIN: Delete invoice
  async deleteInvoiceAdmin(invoiceId) {
    return await deleteData(`/invoices/admin/${invoiceId}`, true);
  }

  // ADMIN: Get summary (for all or specific user)
  async getInvoiceSummaryAdmin(userId = null) {
    const url = userId
      ? `/invoices/admin/summary?user_id=${userId}`
      : `/invoices/admin/summary`;
    return await getData(url, true);
  }

  // ADMIN: Expire old pending invoices
  async expirePendingInvoices(daysOld = 7) {
    return await postData(
      `/invoices/admin/expire-pending?days_old=${daysOld}`,
      true
    );
  }

  // WEBHOOK: Mark invoice as paid
  async markAsPaid(invoiceId) {
    return await postData(
      `/invoices/webhook/payment-success/${invoiceId}`,
      true
    );
  }

  // WEBHOOK: Mark invoice as failed
  async markAsFailed(invoiceId) {
    return await postData(
      `/invoices/webhook/payment-failed/${invoiceId}`,
      true
    );
  }
}

export default new InvoiceService();
