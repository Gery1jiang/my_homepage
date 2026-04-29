const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 51888;
const dataFile = path.join(__dirname, 'data.json');

// 初始化数据文件
function initDataFile() {
    if (!fs.existsSync(dataFile)) {
        const defaultData = {
            bookmarksTree: {
                id: "root",
                name: "根目录",
                type: "folder",
                children: []
            },
            clickStats: {}
        };
        fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2), 'utf8');
    }
}
initDataFile();

// 读取数据
function readData() {
    try {
        const content = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error('读取 data.json 失败:', err);
        return { bookmarksTree: { id: "root", name: "根目录", type: "folder", children: [] }, clickStats: {} };
    }
}

// 写入数据
function writeData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// 判断请求是否是 API
function isApiRequest(req) {
    return req.url.startsWith('/api/');
}

// 处理 API 请求
function handleApi(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /api/bookmarks - 获取所有数据
    if (pathname === '/api/bookmarks' && req.method === 'GET') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    // POST /api/bookmarks - 保存完整数据
    if (pathname === '/api/bookmarks' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newData = JSON.parse(body);
                writeData(newData);
                console.log('数据已保存到 data.json');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // GET /api/bookmarks/tree - 获取书签树
    if (pathname === '/api/bookmarks/tree' && req.method === 'GET') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data.bookmarksTree));
        return;
    }

    // GET /api/bookmarks/stats - 获取点击统计
    if (pathname === '/api/bookmarks/stats' && req.method === 'GET') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data.clickStats));
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API not found' }));
}

// 处理静态文件请求
function serveStaticFile(req, res) {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
    }[extname] || 'text/plain';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

// 创建服务器
const server = http.createServer((req, res) => {
    if (isApiRequest(req)) {
        handleApi(req, res);
    } else {
        serveStaticFile(req, res);
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`数据文件位置: ${dataFile}`);
});