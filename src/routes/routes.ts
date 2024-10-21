import express from 'express';
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController
} from '../controllers/controller';

const router = express.Router();

router.get('/', getAllUsersController);
router.get('/:userId', getUserByIdController);
router.post('/', createUserController);
router.put('/:userId', updateUserController);
router.delete('/:userId', deleteUserController);

export default router;