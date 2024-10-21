import { Request, Response, NextFunction } from 'express';
import { validate as uuidValidate } from 'uuid';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from '../database';

export const getAllUsersController = (_: Request, res: Response, next: NextFunction): void => {
    try {
        const users = getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const getUserByIdController = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const { userId } = req.params;

        if (!uuidValidate(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const user = getUserById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const createUserController = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { name, username, age, hobbies } = req.body;
      
      // Use name if username is not provided
      const finalUsername = username || name;
  
      if (!finalUsername || typeof age !== 'number') {
        res.status(400).json({ message: 'Invalid input: username/name and age are required' });
        return;
      }
  
      // If hobbies is not provided, use an empty array
      const finalHobbies = Array.isArray(hobbies) ? hobbies : [];
  
      const newUser = createUser(finalUsername, age, finalHobbies);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  };

export const updateUserController = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const { userId } = req.params;

        if (!uuidValidate(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const { username, age, hobbies } = req.body;

        if (!username || typeof age !== 'number' || !Array.isArray(hobbies)) {
            res.status(400).json({ message: 'Invalid input' });
            return;
        }

        const updatedUser = updateUser(userId, username, age, hobbies);
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(updatedUser);
        }
    } catch (error) {
        next(error);
    }
};

export const deleteUserController = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const { userId } = req.params;

        if (!uuidValidate(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const deleted = deleteUser(userId);
        if (!deleted) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(204).send();
        }
    } catch (error) {
        next(error);
    }
};