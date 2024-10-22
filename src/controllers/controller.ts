import { IncomingMessage, ServerResponse } from 'http';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../database';


interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}


const parseRequestBody = (req: IncomingMessage, callback: (data: Partial<User>) => void): void => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            callback(JSON.parse(body || '{}'));
        } catch (error) {
            callback({});
        }
    });
};

const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

const getAllUsersController = (_req: IncomingMessage, res: ServerResponse): void => {
    const users: User[] = getAllUsers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
};


const getUserByIdController = (_req: IncomingMessage, res: ServerResponse, userId: string): void => {
    if (!isValidUUID(userId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid user ID format' }));
        return;
    }
    const user: User | undefined = getUserById(userId);
    if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
    }
};


const createUserController = (req: IncomingMessage, res: ServerResponse): void => {
    parseRequestBody(req, (data: Partial<User>) => {
        const { username, age, hobbies } = data;

        if (!username) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Username is required' }));
            return;
        }

        const newUser: User = createUser(username, age ?? 0, hobbies || []);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newUser));
    });
};

const updateUserController = (req: IncomingMessage, res: ServerResponse, userId: string): void => {
  
    if (!isValidUUID(userId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid user ID format' }));
        return;
    }

   
    parseRequestBody(req, (data: Partial<User>) => {
        const { username, age, hobbies } = data;

       
        if (username === undefined || age === undefined || !Array.isArray(hobbies)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid input' }));
            return;
        }

       
        const updatedUser: User | null = updateUser(userId, username, age, hobbies);
        if (!updatedUser) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedUser));
        }
    });
};



const deleteUserController = (_req: IncomingMessage, res: ServerResponse, userId: string): void => {
    
    if (!isValidUUID(userId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid user ID format' }));
        return;
    }

    
    const deleted: boolean = deleteUser(userId);
    if (!deleted) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
    } else {
        res.writeHead(204); 
        res.end();
    }
};

export {
    getAllUsersController,
    getUserByIdController,
    createUserController,
    updateUserController,
    deleteUserController
};
