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

    // Serve HTML UI
    if (pathname === '/' && req.method === 'GET') {
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student GPA Management</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .search-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .search-box {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        input {
            flex: 1;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            padding: 12px 30px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s, transform 0.1s;
        }
        button:hover {
            background: #5568d3;
        }
        button:active {
            transform: scale(0.98);
        }
        .button-group {
            display: flex;
            gap: 10px;
        }
        #studentTable {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        #studentTable th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        #studentTable td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }
        #studentTable tr:hover {
            background: #f8f9fa;
        }
        .gpa-high {
            color: #28a745;
            font-weight: bold;
        }
        .gpa-medium {
            color: #ffc107;
            font-weight: bold;
        }
        .gpa-low {
            color: #dc3545;
            font-weight: bold;
        }
        .message {
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            display: none;
        }
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin-top: 20px;
            gap: 20px;
        }
        .stat-card {
            flex: 1;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-card h3 {
            font-size: 2em;
            margin-bottom: 5px;
        }
        .stat-card p {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 Student GPA Management System</h1>
        
        <div class="search-section">
            <div class="search-box">
                <input type="text" id="studentId" placeholder="Enter Student ID (e.g., ENG001)">
                <button onclick="searchStudent()">Search Student</button>
            </div>
            <div class="button-group">
                <button onclick="loadAllStudents()">Load All Students</button>
                <button onclick="clearResults()">Clear</button>
            </div>
            <div id="message" class="message"></div>
        </div>

        <div id="stats" class="stats" style="display:none;">
            <div class="stat-card">
                <h3 id="totalStudents">0</h3>
                <p>Total Students</p>
            </div>
            <div class="stat-card">
                <h3 id="avgGPA">0.00</h3>
                <p>Average GPA</p>
            </div>
            <div class="stat-card">
                <h3 id="highestGPA">0.00</h3>
                <p>Highest GPA</p>
            </div>
        </div>

        <table id="studentTable">
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>GPA</th>
                </tr>
            </thead>
            <tbody id="tableBody">
            </tbody>
        </table>
    </div>

    <script>
        function showMessage(message, type) {
            const msgDiv = document.getElementById('message');
            msgDiv.textContent = message;
            msgDiv.className = 'message ' + type;
            msgDiv.style.display = 'block';
            setTimeout(() => {
                msgDiv.style.display = 'none';
            }, 3000);
        }

        function getGPAClass(gpa) {
            if (gpa >= 3.75) return 'gpa-high';
            if (gpa >= 3.50) return 'gpa-medium';
            return 'gpa-low';
        }

        function displayStudents(students) {
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            
            students.forEach(student => {
                const row = tbody.insertRow();
                row.innerHTML = \`
                    <td>\${student.id}</td>
                    <td>\${student.name}</td>
                    <td>\${student.department}</td>
                    <td class="\${getGPAClass(student.gpa)}">\${student.gpa.toFixed(2)}</td>
                \`;
            });

            // Calculate and display stats
            if (students.length > 0) {
                const totalGPA = students.reduce((sum, s) => sum + s.gpa, 0);
                const avgGPA = totalGPA / students.length;
                const highestGPA = Math.max(...students.map(s => s.gpa));

                document.getElementById('totalStudents').textContent = students.length;
                document.getElementById('avgGPA').textContent = avgGPA.toFixed(2);
                document.getElementById('highestGPA').textContent = highestGPA.toFixed(2);
                document.getElementById('stats').style.display = 'flex';
            }
        }

        async function loadAllStudents() {
            try {
                const response = await fetch('/api/students/gpa');
                const result = await response.json();
                
                if (result.success) {
                    displayStudents(result.data);
                    showMessage(\`Loaded \${result.total} students successfully!\`, 'success');
                } else {
                    showMessage('Error loading students: ' + result.error, 'error');
                }
            } catch (error) {
                showMessage('Network error: ' + error.message, 'error');
            }
        }

        async function searchStudent() {
            const studentId = document.getElementById('studentId').value.trim();
            
            if (!studentId) {
                showMessage('Please enter a student ID', 'error');
                return;
            }

            try {
                const response = await fetch(\`/api/students/gpa/id?id=\${studentId}\`);
                const result = await response.json();
                
                if (result.success) {
                    displayStudents([result.data]);
                    showMessage('Student found!', 'success');
                } else {
                    showMessage('Student not found', 'error');
                    document.getElementById('tableBody').innerHTML = '';
                    document.getElementById('stats').style.display = 'none';
                }
            } catch (error) {
                showMessage('Network error: ' + error.message, 'error');
            }
        }

        function clearResults() {
            document.getElementById('tableBody').innerHTML = '';
            document.getElementById('studentId').value = '';
            document.getElementById('stats').style.display = 'none';
            document.getElementById('message').style.display = 'none';
        }

        // Load all students on page load
        loadAllStudents();
    </script>
</body>
</html>
        `);
        return;
    }

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
    console.log(`\nOpen your browser and navigate to: http://localhost:${PORT}/`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  GET / - Web UI`);
    console.log(`  GET /api/students/gpa - Get all students GPA`);
    console.log(`  GET /api/students/gpa/id?id=ENG001 - Get student GPA by ID`);
});