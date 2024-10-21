import { v4 as uuidv4 } from 'uuid';

interface User {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

let users: User[] = [];

export const initializeDatabase = (withUsers: boolean = true) => {
    if (withUsers) {
        users = [
            { id: uuidv4(), username: "John Doe", age: 30, hobbies: ["reading", "swimming"] },
            { id: uuidv4(), username: "Jane Smith", age: 25, hobbies: ["painting", "yoga"] },
            { id: uuidv4(), username: "Bob Johnson", age: 35, hobbies: ["hiking", "cooking"] }
        ];
    } else {
        users = []; // Initialize with an empty array for tests
    }
};

export const getAllUsers = () => users;

export const getUserById = (id: string) => users.find(user => user.id === id);

export const createUser = (username: string, age: number, hobbies: string[]) => {
    const newUser: User = { id: uuidv4(), username, age, hobbies };
    users.push(newUser);
    return newUser;
};

export const updateUser = (id: string, username: string, age: number, hobbies: string[]) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        const updatedUser: User = { id, username, age, hobbies };
        users[index] = updatedUser; // Update the user in the array
        return updatedUser;
    }
    return null; // User not found
};

export const deleteUser = (id: string) => {
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users.splice(index, 1); // Remove user from the array
        return true; // Successfully deleted
    }
    return false; // User not found
};
