import { postData } from "../lib/axios";

const OrderService = {
  filterOrders: (filters) => postData("/orders/filter", filters),
};

export default OrderService;
