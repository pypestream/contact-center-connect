export const getCustomer = (base64Customer: string) => {
  if (!base64Customer) {
    throw new Error('x-pypestream-customer header is null');
  }
  const stringifyCustomer = Buffer.from(base64Customer, 'base64').toString(
    'ascii',
  );
  const customer = JSON.parse(stringifyCustomer);
  return customer;
};
