const express = require('express');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initial student enrollment data
let enrollments = [
    {
        id: 601,
        studentName: "Aarav Gupta",
        courseCode: "CS301",
        courseName: "Data Structures",
        semester: 3,
        attendance: 82
    },
    {
        id: 602,
        studentName: "Meera Joshi",
        courseCode: "CS305",
        courseName: "Database Systems",
        semester: 3,
        attendance: 74
    },
    {
        id: 603,
        studentName: "Kabir Khan",
        courseCode: "CS310",
        courseName: "Computer Networks",
        semester: 3,
        attendance: 91
    }
];

// Generate unique ID
let nextId = 604;

// Validate enrollment data
function validateEnrollment(data) {
    return (
        data &&
        typeof data.studentName === "string" &&
        data.studentName.trim() !== "" &&

        typeof data.courseCode === "string" &&
        data.courseCode.trim() !== "" &&

        typeof data.courseName === "string" &&
        data.courseName.trim() !== "" &&

        Number.isInteger(data.semester) &&
        data.semester > 0 &&

        typeof data.attendance === "number" &&
        Number.isFinite(data.attendance) &&
        data.attendance >= 0 &&
        data.attendance <= 100
    );
}

// Check duplicate course code
function duplicateCourseCode(code, excludeId = null) {
    return enrollments.some(
        e => e.courseCode === code && e.id !== excludeId
    );
}

// HOME ROUTE
app.get('/', (req, res) => {
    res.send("Student Course Enrollment API is Running");
});

// 1. GET ALL ENROLLMENTS
app.get('/api/enrollments', (req, res) => {
    res.status(200).json(enrollments);
});

// 2. POST NEW ENROLLMENT
app.post('/api/enrollments', (req, res) => {

    const data = req.body;

    if (!validateEnrollment(data)) {
        return res.status(400).json({
            message: "Invalid enrollment data"
        });
    }

    if (duplicateCourseCode(data.courseCode)) {
        return res.status(400).json({
            message: "Course code already exists"
        });
    }

    const newEnrollment = {
        id: nextId++,
        studentName: data.studentName.trim(),
        courseCode: data.courseCode.trim(),
        courseName: data.courseName.trim(),
        semester: data.semester,
        attendance: data.attendance
    };

    enrollments.push(newEnrollment);

    res.status(201).json(newEnrollment);
});

// 3. FILTER BY SEMESTER
// Keep this route before /:id
app.get('/api/enrollments/filter', (req, res) => {

    const value = req.query.semester;

    if (
        value === undefined ||
        !/^\d+$/.test(value) ||
        Number(value) <= 0
    ) {
        return res.status(400).json({
            message: "Please enter a valid semester"
        });
    }

    const semester = Number(value);

    const result = enrollments.filter(
        e => e.semester === semester
    );

    res.status(200).json(result);
});

// 4. GET LOW ATTENDANCE
// Keep this route before /:id
app.get('/api/enrollments/low-attendance', (req, res) => {

    const result = enrollments.filter(
        e => e.attendance < 75
    );

    res.status(200).json(result);
});

// 5. GET ENROLLMENT BY ID
app.get('/api/enrollments/:id', (req, res) => {

    const id = Number(req.params.id);

    const record = enrollments.find(
        e => e.id === id
    );

    if (!Number.isInteger(id) || !record) {
        return res.status(404).json({
            message: "Enrollment not found"
        });
    }

    res.status(200).json(record);
});

// 6. PUT UPDATE ENROLLMENT
app.put('/api/enrollments/:id', (req, res) => {

    const id = Number(req.params.id);

    const index = enrollments.findIndex(
        e => e.id === id
    );

    if (!Number.isInteger(id) || index === -1) {
        return res.status(404).json({
            message: "Enrollment not found"
        });
    }

    const data = req.body;

    if (!validateEnrollment(data)) {
        return res.status(400).json({
            message: "Invalid enrollment data"
        });
    }

    if (duplicateCourseCode(data.courseCode, id)) {
        return res.status(400).json({
            message: "Course code already exists"
        });
    }

    enrollments[index] = {
        id: id,
        studentName: data.studentName.trim(),
        courseCode: data.courseCode.trim(),
        courseName: data.courseName.trim(),
        semester: data.semester,
        attendance: data.attendance
    };

    res.status(200).json(enrollments[index]);
});

// 7. DELETE ENROLLMENT
app.delete('/api/enrollments/:id', (req, res) => {

    const id = Number(req.params.id);

    const index = enrollments.findIndex(
        e => e.id === id
    );

    if (!Number.isInteger(id) || index === -1) {
        return res.status(404).json({
            message: "Enrollment not found"
        });
    }

    enrollments.splice(index, 1);

    res.status(200).json({
        message: "Enrollment deleted successfully"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});