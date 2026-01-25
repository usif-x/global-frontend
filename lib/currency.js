import axios from "axios";

export const fetchCurrencyConversion = async ({ from, to, amount }) => {
  const response = await axios.get(
    `/api/currency/convert?from=${from}&to=${to}&amount=${amount}`,
  );
  return response.data;
};
