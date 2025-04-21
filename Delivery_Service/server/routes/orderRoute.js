// Add new route for restaurant ready notification
router.patch(
    "/:id/ready-for-delivery",
    protect,
    authorize("restaurant"),
    initiateDelivery
  );
  
  // Keep existing delivery-location route
  router.patch(
    "/:id/delivery-location",
    protect,
    authorize("delivery"),
    updateDeliveryLocation
  );