export const bankTransfer = async (restaurantId, amount, description) => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    reference: `MOCK-${Date.now()}-${restaurantId}`,
    amount: amount,
  };
};
