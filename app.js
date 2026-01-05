const http = require('http');
const url = require('url');

// Mock data for students with GPA from different departments
const studentsData = [
    { id: 'ENG001', name: 'Alice Johnson', department: 'Civil Engineering', gpa: 3.85 },
    { id: 'ENG002', name: 'Bob Smith', department: 'Electrical Engineering', gpa: 3.72 },
    { id: 'ENG003', name: 'Carol White', department: 'Mechanical Engineering', gpa: 3.91 },
    { id: 'ENG004', name: 'David Lee', department: 'Chemical Engineering', gpa: 3.65 },
    { id: 'ENG005', name: 'Emma Davis', department: 'Civil Engineering', gpa: 3.88 },
    { id: 'ENG006', name: 'Frank Wilson', department: 'Electrical Engineering', gpa: 3.54 },
];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    res.setHeader('Content-Type', 'application/json');

    // API 1: Get all students GPA
    if (pathname === '/api/students/gpa' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
            success: true,
            data: studentsData,
            total: studentsData.length
        }));
    }
    // API 2: Get individual student GPA by ID
    else if (pathname === '/api/students/gpa/id' && req.method === 'GET') {
        const studentId = query.id;

        if (!studentId) {
            res.writeHead(400);
            res.end(JSON.stringify({
                success: false,
                error: 'Student ID is required'
            }));
            return;
        }

        const student = studentsData.find(s => s.id === studentId);

        if (student) {
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                data: student
            }));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({
                success: false,
                error: 'Student not found'
            }));
        }
    }
    // Not found
    else {
        res.writeHead(404);
        res.end(JSON.stringify({
            success: false,
            error: 'Endpoint not found'
        }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET /api/students/gpa - Get all students GPA`);
    console.log(`  GET /api/students/gpa/id?id=ENG001 - Get student GPA by ID`);
});