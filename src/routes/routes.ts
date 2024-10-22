import { IncomingMessage, ServerResponse } from 'http';
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController
} from '../controllers/controller';


export type Controller = (req: IncomingMessage, res: ServerResponse, userId?: string) => void;


export const handleRequest = (req: IncomingMessage, res: ServerResponse): void => {
  const urlParts = req.url ? req.url.split('/') : [];
  const method = req.method;
  const userId = urlParts[3]; 
  if (urlParts[2] === 'users') {
    switch (method) {
      case 'GET':
        if (userId) {
          getUserByIdController(req, res, userId);
        } else {
          console.log(req.url)
          getAllUsersController(req, res);
        }
        break;
      case 'POST':
        createUserController(req, res);
        break;
      case 'PUT':
        updateUserController(req, res, userId);
        break;
      case 'DELETE':
        deleteUserController(req, res, userId);
        break;
      default:
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
};
