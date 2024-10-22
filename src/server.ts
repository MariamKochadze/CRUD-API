import http, { IncomingMessage, ServerResponse } from 'http';
import { handleRequest } from './routes/routes';


const PORT: number = parseInt(process.env.PORT || '4000', 10);


const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    handleRequest(req, res);

});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
