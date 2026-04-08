const http = require('http');

const port = Number(process.env.PORT || 4100);

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        service: 'sandbox-worker',
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  if (req.url === '/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          accepted: true,
          message: 'Sandbox execution hook scaffolded. Wire Docker exec here.',
          body: body ? JSON.parse(body) : null,
        }),
      );
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`sandbox-worker listening on ${port}`);
});

