import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import {
  getAllCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  resetCartItems,
  updateMultipleCartItems,
} from "../controller/cartItemController.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(authorize("customer"), addCartItem)
  .get(authorize("customer"), getAllCartItems);
router
  .route("/:id")
  .put(authorize("customer"), updateCartItem)
  .delete(authorize("customer"), deleteCartItem);
router.post("/reset", authorize("customer"), resetCartItems);
router.post("/bulk-update", authorize("customer"), updateMultipleCartItems);

export default router;
