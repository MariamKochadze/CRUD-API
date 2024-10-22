import http, { IncomingMessage, ServerResponse } from 'http';
import { cpus } from 'os';
import cluster from 'cluster';
import { createUser, getAllUsers, getUserById, deleteUser } from './database';

const MASTER_PORT = Number(process.env.PORT) || 4000;
const WORKER_PORT_START = MASTER_PORT + 1;
const numCPUs = cpus().length;
const workerPorts: number[] = [];


const parseRequestBody = (req: IncomingMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
    });
};


const sendJSON = (res: ServerResponse, statusCode: number, data: any): void => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

if (cluster.isPrimary) {
 
    for (let i = 0; i < numCPUs - 1; i++) {
        const workerPort = WORKER_PORT_START + i;
        workerPorts.push(workerPort);
        cluster.fork({ WORKER_PORT: workerPort.toString() });
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        const index = worker.id ? worker.id - 1 : 0;
        const newWorkerPort = workerPorts[index];
        if (newWorkerPort) {
            cluster.fork({ WORKER_PORT: newWorkerPort.toString() });
        }
    });

   
    const loadBalancer = http.createServer((req: IncomingMessage, res: ServerResponse) => {
        const targetPort = workerPorts[Math.floor(Math.random() * workerPorts.length)];
        const proxy = http.request(
            {
                hostname: 'localhost',
                port: targetPort,
                path: req.url,
                method: req.method,
                headers: req.headers,
            },
            (proxyRes) => {
                proxyRes.pipe(res);
            }
        );

        req.pipe(proxy);
    });

    loadBalancer.listen(MASTER_PORT, () => {
        console.log(`Load balancer running on port ${MASTER_PORT}`);
        console.log(`Workers running on ports ${workerPorts.join(', ')}`);
    });

} else if (cluster.isWorker) {
    
    const workerPort = Number(process.env.WORKER_PORT);
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
        const { method, url } = req;

        
        if (url?.startsWith('/api/users') && method === 'POST') {
            try {
                const body = await parseRequestBody(req);
                const { username, age, hobbies } = body;
                const user = createUser(username, age, hobbies);
                sendJSON(res, 201, user);
            } catch (error) {
                sendJSON(res, 400, { error: 'Invalid JSON input' });
            }

        } else if (url === '/api/users' && method === 'GET') {
            const users = getAllUsers();
            sendJSON(res, 200, users);

        } else if (url?.startsWith('/api/users/') && method === 'GET') {
            const userId = url.split('/')[3];
            const user = getUserById(userId);
            if (user) {
                sendJSON(res, 200, user);
            } else {
                sendJSON(res, 404, { error: 'User not found' });
            }

        } else if (url?.startsWith('/api/users/') && method === 'DELETE') {
            const userId = url.split('/')[3];
            const success = deleteUser(userId);
            if (success) {
                res.writeHead(204);
                res.end();
            } else {
                sendJSON(res, 404, { error: 'User not found' });
            }

        } else {
            sendJSON(res, 404, { error: 'Route not found' });
        }
    });

    server.listen(workerPort, () => {
        console.log(`Worker ${process.pid} running on port ${workerPort}`);
    });
}
