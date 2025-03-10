import Router from "express";
import * as userController from "./controller/user.controller.js";
import {
  changePasswordSchema,
  headersSchema,
  updateUserSchema,
} from "./controller/user.validation.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

//user profile
router.get(
  "/userProfile",
  isValid(headersSchema, true),
  auth(["user"]),
  userController.userProfile
);

//update user
router.post(
  "/updateUser",
  isValid(headersSchema, true),
  auth(["user"]),
  isValid(updateUserSchema),
  userController.updateUser
);

//update password
router.patch(
  "/changePassword",
  isValid(headersSchema, true),
  auth(["user"]),
  isValid(changePasswordSchema),
  userController.changePassword
);
//delete user
router.patch(
  "/deleteUser",
  isValid(headersSchema, true),
  auth(["user"]),
  userController.deleteUser
);

//recover account
router.get("/accountRecovery/:reactiveToken", userController.accountRecovery);

export default router;
