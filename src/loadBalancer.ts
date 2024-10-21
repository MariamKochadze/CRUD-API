import express, { Request, Response } from 'express';
import httpProxy from 'http-proxy';
import os from 'os';
import cluster from 'cluster';
import { createUser, getAllUsers, getUserById, deleteUser } from './database';

const app = express();
const MASTER_PORT = Number(process.env.PORT) || 4000;
const WORKER_PORT_START = MASTER_PORT + 1;
const proxy = httpProxy.createProxyServer({});
const workerPorts: number[] = [];

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    // Fork workers
    for (let i = 0; i < numCPUs - 1; i++) {
        const workerPort = WORKER_PORT_START + i;
        workerPorts.push(workerPort);
        cluster.fork({ WORKER_PORT: workerPort.toString() });
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        // Restart the worker
        const index = worker.id ? worker.id - 1 : 0;
        const newWorkerPort = workerPorts[index];
        if (newWorkerPort) {
            cluster.fork({ WORKER_PORT: newWorkerPort.toString() });
        }
    });

    // Load balancer logic to distribute requests
    app.use('/api', (req: Request, res: Response) => {
        const targetPort = workerPorts[Math.floor(Math.random() * workerPorts.length)];
        proxy.web(req, res, { target: `http://localhost:${targetPort}` });
    });

    app.listen(MASTER_PORT, () => {
        console.log(`Load balancer running on port ${MASTER_PORT}`);
        console.log(`Workers running on ports ${workerPorts.join(', ')}`);
    });

} else if (cluster.isWorker) {
    // Worker process
    const workerPort = Number(process.env.WORKER_PORT);
    const workerApp = express();

    workerApp.use(express.json());

    // API routes
    workerApp.post('/api/users', (req: Request, res: Response) => {
        const { username, age, hobbies } = req.body;
        const user = createUser(username, age, hobbies);
        res.status(201).json(user);
    });

    workerApp.get('/api/users', (_req: Request, res: Response) => {
        const users = getAllUsers();
        res.json(users);
    });

    workerApp.get('/api/users/:id', (req: Request, res: Response) => {
        const user = getUserById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });

    workerApp.delete('/api/users/:id', (req: Request, res: Response) => {
        const success = deleteUser(req.params.id);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });

    workerApp.listen(workerPort, () => {
        console.log(`Worker ${process.pid} running on port ${workerPort}`);
    });
}