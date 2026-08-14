import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import {
    Users,
    Plus,
    Search,
    Upload,
    Download,
    Key,
    Trash2,
    Edit,
    X,
    Check,
    FileSpreadsheet,
    Eye,
    EyeOff,
    Copy,
    CheckCircle,
    BarChart2,
    Mail,
    Phone,
    MapPin,
    School,
    Calendar,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    ArrowLeft,
    FileText,
    ClipboardList,
    Trophy,
    Clock,
    Zap,
    Target,
    Award,
    BookOpen,
    Gamepad2,
    Video,
    Activity,
    Loader
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MOCK_STUDENTS = [
    {
        _id: 'mock-1',
        name: 'Alice Johnson',
        rollNumber: 'R-2024-001',
        studentClass: '10th Grade - Section A',
        email: 'alice.j@example.com',
        phone: '(555) 123-4567',
        address: '123 Maple Avenue, Springfield',
        school: 'Springfield High School',
        joiningDate: '2024-01-15',
        credentialsGenerated: true
    },
    {
        _id: 'mock-2',
        name: 'Bob Smith',
        rollNumber: 'R-2024-002',
        studentClass: '10th Grade - Section A',
        email: 'bob.smith@example.com',
        phone: '(555) 987-6543',
        address: '456 Oak Lane, Springfield',
        school: 'Springfield High School',
        joiningDate: '2024-01-16',
        credentialsGenerated: false
    },
    {
        _id: 'mock-3',
        name: 'Charlie Brown',
        rollNumber: 'R-2024-003',
        studentClass: '10th Grade - Section B',
        email: 'charlie.b@example.com',
        phone: '(555) 456-7890',
        address: '789 Pine Street, Springfield',
        school: 'Springfield High School',
        joiningDate: '2024-01-20',
        credentialsGenerated: true
    },
    {
        _id: 'mock-4',
        name: 'Diana Prince',
        rollNumber: 'R-2024-004',
        studentClass: '11th Grade - Section A',
        email: 'diana.p@example.com',
        phone: '(555) 234-5678',
        address: '321 Elm St, Gotham',
        school: 'Gotham Academy',
        joiningDate: '2024-02-01',
        credentialsGenerated: false
    },
    {
        _id: 'mock-5',
        name: 'Evan Wright',
        rollNumber: 'R-2024-005',
        studentClass: '9th Grade - Section C',
        email: 'evan.w@example.com',
        phone: '(555) 876-5432',
        address: '654 Birch Rd, Metropolis',
        school: 'Metropolis High',
        joiningDate: '2024-02-10',
        credentialsGenerated: true
    }
];

const StudentManagement = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const assignmentsSectionRef = useRef(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [generatedCredentials, setGeneratedCredentials] = useState([]);
    const [showPasswords, setShowPasswords] = useState({});
    const [copiedId, setCopiedId] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [expandedStudentId, setExpandedStudentId] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsTab, setDetailsTab] = useState('overview');
    const fileInputRef = useRef(null);
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 15;

    // Get class filter from URL params
    const classFilter = {
        classId: searchParams.get('classId'),
        grade: searchParams.get('grade'),
        section: searchParams.get('section')
    };
    const isFilteredByClass = classFilter.grade && classFilter.section;

    const [newStudent, setNewStudent] = useState({
        name: '',
        rollNumber: '',
        studentClass: '',
        email: '',
        phone: '',
        address: '',
        school: '',
        joiningDate: ''
    });

    const [importData, setImportData] = useState([]);

    // Get teacher ID from localStorage (use teacherId for API calls)
    const getTeacherId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.teacherId || user.id;
    };

    // Fetch students
    const fetchStudents = async () => {
        try {
            const teacherId = getTeacherId();
            // If no teacher ID (e.g. dev mode without login), use mock data
            if (!teacherId) {
                console.log('No teacher ID found, using mock data');
                setStudents(MOCK_STUDENTS);
                setLoading(false);
                return;
            }

            let url = `${API_BASE_URL}/teacher/students/${teacherId}`;
            
            // If filtered by class, fetch students for that specific class
            if (isFilteredByClass && classFilter.classId) {
                url = `${API_BASE_URL}/class/${classFilter.classId}/students`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                // Handle response from class endpoint (students are in data.data.students)
                const studentsList = data.data.students || data.data || [];
                if (studentsList.length > 0) {
                    setStudents(studentsList);
                } else {
                    setStudents([]);
                }
            } else {
                console.log('No students found');
                setStudents([]);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch student details
    const fetchStudentDetails = async (studentId) => {
        console.log('Fetching details for student ID:', studentId);
        setLoadingDetails(true);
        try {
            const response = await fetch(`${API_BASE_URL}/teacher/student-details/${studentId}`);
            const data = await response.json();
            
            console.log('Student details response:', data);
            
            if (data.success) {
                setStudentDetails(data.data);
                console.log('Student details set:', data.data);
            } else {
                console.error('Failed to fetch student details:', data.message);
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleViewDetails = (student) => {
        console.log('View Details clicked for student:', student);
        setViewingStudent(student);
        fetchStudentDetails(student._id);
    };

    // Fetch assignments for the class
    const fetchAssignments = async () => {
        if (!isFilteredByClass || !classFilter.classId) return;
        
        setLoadingAssignments(true);
        try {
            const response = await fetch(`${API_BASE_URL}/assignment/class/${classFilter.classId}`);
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setAssignments(data);
            } else {
                setAssignments([]);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setAssignments([]);
        } finally {
            setLoadingAssignments(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        if (isFilteredByClass) {
            fetchAssignments();
        }
    }, [searchParams]);

    // Scroll to assignments section if hash is present
    useEffect(() => {
        if (location.hash === '#assignments' && assignmentsSectionRef.current && !loadingAssignments) {
            setTimeout(() => {
                assignmentsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        }
    }, [location.hash, loadingAssignments]);

    // Create student manually
    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            const teacherId = getTeacherId();
            const response = await fetch(`${API_BASE_URL}/teacher/create-students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newStudent, teacherId })
            });

            const data = await response.json();

            if (data.success) {
                setStudents(prev => [...prev, data.data]);
                setShowAddModal(false);
                setNewStudent({
                    name: '',
                    rollNumber: '',
                    studentClass: '',
                    email: '',
                    phone: '',
                    address: '',
                    school: '',
                    joiningDate: ''
                });
                
                // Show generated credentials to teacher
                if (data.data.generatedPassword) {
                    setGeneratedCredentials([{
                        _id: data.data._id,
                        name: data.data.name,
                        rollNumber: data.data.rollNumber,
                        email: data.data.email,
                        username: data.data.rollNumber,
                        password: data.data.generatedPassword
                    }]);
                    setShowCredentialsModal(true);
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating student:', error);
            // For demo purposes, add to local state even if API fails
            const mockNewStudent = {
                ...newStudent,
                _id: `temp-${Date.now()}`,
                credentialsGenerated: false
            };
            setStudents(prev => [...prev, mockNewStudent]);
            setShowAddModal(false);
            alert('Student added locally (API connection failed)');
        }
    };

    // Import students from CSV/Excel
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

        if (isExcel) {
            // For Excel files, send directly to backend for parsing
            try {
                const teacherId = getTeacherId();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('teacherId', teacherId);

                const response = await fetch(`${API_BASE_URL}/teacher/import-students-file`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    fetchStudents();
                    
                    // Show credentials modal with imported students' credentials
                    if (data.credentials && data.credentials.length > 0) {
                        setGeneratedCredentials(data.credentials);
                        setShowCredentialsModal(true);
                    } else {
                        alert(data.message);
                    }
                } else {
                    alert(data.message || 'Failed to import students');
                }
            } catch (error) {
                console.error('Error importing Excel file:', error);
                alert('Failed to import Excel file');
            }
        } else {
            // For CSV files, parse on client side and show preview
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                const parsedData = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim());
                    if (values.length >= 4) { // At least name, rollNumber, email, phone
                        const student = {
                            name: values[headers.indexOf('name')] || values[0],
                            rollNumber: values[headers.indexOf('rollnumber')] || values[headers.indexOf('roll number')] || values[1],
                            studentClass: values[headers.indexOf('class')] || values[headers.indexOf('studentclass')] || values[2] || '',
                            email: values[headers.indexOf('email')] || values[3],
                            phone: values[headers.indexOf('phone')] || values[headers.indexOf('phone number')] || values[4],
                            address: values[headers.indexOf('address')] || values[5] || '',
                            school: values[headers.indexOf('school')] || values[6] || '',
                            joiningDate: values[headers.indexOf('joiningdate')] || values[headers.indexOf('joining date')] || values[7] || ''
                        };
                        parsedData.push(student);
                    }
                }

                setImportData(parsedData);
                setShowImportModal(true);
            };
            reader.readAsText(file);
        }
        e.target.value = ''; // Reset file input
    };

    const handleImportStudents = async () => {
        try {
            const teacherId = getTeacherId();
            const response = await fetch(`${API_BASE_URL}/teacher/import-students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: importData, teacherId })
            });

            const data = await response.json();

            if (data.success) {
                fetchStudents();
                setShowImportModal(false);
                setImportData([]);
                
                // Show credentials modal with imported students' credentials
                if (data.credentials && data.credentials.length > 0) {
                    setGeneratedCredentials(data.credentials);
                    setShowCredentialsModal(true);
                } else {
                    alert(data.message);
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error importing students:', error);
            alert('Failed to import students');
        }
    };

    // Generate credentials
    const handleGenerateCredentials = async () => {
        if (selectedStudents.length === 0) {
            alert('Please select students to generate credentials');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/teacher/generate-credentials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentIds: selectedStudents })
            });

            const data = await response.json();

            if (data.success) {
                setGeneratedCredentials(data.data);
                setShowCredentialsModal(true);
                // Update local state to reflect generated credentials
                setStudents(prev => prev.map(s =>
                    selectedStudents.includes(s._id) ? { ...s, credentialsGenerated: true } : s
                ));
                setSelectedStudents([]);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error generating credentials:', error);
            alert('Failed to generate credentials');
        }
    };

    // Delete student
    const handleDeleteStudent = async (studentId, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/teacher/students/${studentId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setStudents(students.filter(s => s._id !== studentId));
            } else {
                // If it's a mock student, just remove it from state
                if (studentId.toString().startsWith('mock-') || studentId.toString().startsWith('temp-')) {
                    setStudents(students.filter(s => s._id !== studentId));
                } else {
                    alert(data.message);
                }
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            // Fallback for mock/offline
            setStudents(students.filter(s => s._id !== studentId));
        }
    };

    // Update student
    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/teacher/students/${editingStudent._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingStudent)
            });

            const data = await response.json();

            if (data.success) {
                setStudents(students.map(s => s._id === editingStudent._id ? data.data : s));
                setEditingStudent(null);
            } else {
                // If it's a mock student, just update state
                if (editingStudent._id.toString().startsWith('mock-') || editingStudent._id.toString().startsWith('temp-')) {
                    setStudents(students.map(s => s._id === editingStudent._id ? editingStudent : s));
                    setEditingStudent(null);
                } else {
                    alert(data.message);
                }
            }
        } catch (error) {
            console.error('Error updating student:', error);
            // Fallback for mock/offline
            setStudents(students.map(s => s._id === editingStudent._id ? editingStudent : s));
            setEditingStudent(null);
        }
    };

    // Toggle student selection
    const toggleStudentSelection = (studentId, e) => {
        e.stopPropagation();
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Select all students
    const toggleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
    };

    // Copy to clipboard
    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Download credentials as CSV
    const downloadCredentials = () => {
        const csvContent = "Name, RollNumber, Username, Password, Email\n" +
            generatedCredentials.map(c =>
                `${c.name}, ${c.rollNumber}, ${c.username}, ${c.password}, ${c.email}`
            ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_credentials.csv';
        a.click();
    };

    const toggleExpandStudent = (studentId) => {
        setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
    };

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Helper to get initials
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f9ff, #f0fdf4)' }}>
            <Navigation userType="teacher" />
            <div style={{ padding: '1rem', paddingTop: '5rem', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Back button when filtered by class */}
                {isFilteredByClass && (
                    <button
                        onClick={() => navigate('/teacher/classes')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            color: '#374151'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to Classes
                    </button>
                )}

                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                                {isFilteredByClass 
                                    ? `Students - Grade ${classFilter.grade} Section ${classFilter.section}`
                                    : 'Student Management'
                                }
                            </h1>
                            <p style={{ color: '#6b7280' }}>
                                {isFilteredByClass 
                                    ? `Viewing students in Grade ${classFilter.grade} - Section ${classFilter.section}`
                                    : 'Add, import, and manage student credentials'
                                }
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={{
                                    backgroundColor: '#059669',
                                    color: 'white',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Plus size={18} />
                                Add Student
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".csv,.txt,.xlsx,.xls"
                                style={{ display: 'none' }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Upload size={18} />
                                Import CSV/Excel
                            </button>
                            {isFilteredByClass && (
                                <button
                                    onClick={() => navigate(`/teacher/assignments?classId=${classFilter.classId}&grade=${classFilter.grade}&section=${classFilter.section}`)}
                                    style={{
                                        backgroundColor: '#8b5cf6',
                                        color: 'white',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FileText size={18} />
                                    Create Assignment
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Search and Actions Bar */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                            <input
                                type="text"
                                placeholder="Search students by name, roll number, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    paddingLeft: '2.5rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem'
                                }}
                            />
                        </div>
                        {selectedStudents.length > 0 && (
                            <button
                                onClick={handleGenerateCredentials}
                                style={{
                                    backgroundColor: '#7c3aed',
                                    color: 'white',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Key size={18} />
                                Generate Credentials ({selectedStudents.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Students Accordion View - Dashboard Style */}
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                        Loading students...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                        <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No students found. Add students manually or import from CSV.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {paginatedStudents.map((student) => (
                            <div
                                key={student._id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                    border: '1px solid #f3f4f6',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Accordion Header */}
                                <div
                                    onClick={() => toggleExpandStudent(student._id)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        backgroundColor: expandedStudentId === student._id ? '#f9fafb' : 'white',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student._id)}
                                            onChange={(e) => toggleStudentSelection(student._id, e)}
                                            style={{ cursor: 'pointer' }}
                                        />

                                        {/* Avatar */}
                                        <div style={{
                                            width: '2.5rem',
                                            height: '2.5rem',
                                            borderRadius: '9999px',
                                            background: 'linear-gradient(to bottom right, #34d399, #22d3ee)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                {getInitials(student.name)}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
                                                    {student.name}
                                                </h3>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.125rem 0.375rem',
                                                    borderRadius: '0.25rem',
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#4b5563',
                                                    fontWeight: '500'
                                                }}>
                                                    {student.rollNumber}
                                                </span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {student.studentClass || student.class || 'Class not assigned'}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(student); }}
                                            style={{
                                                padding: '0.375rem',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#9ca3af',
                                                borderRadius: '0.25rem',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#10b981'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingStudent(student); }}
                                            style={{
                                                padding: '0.375rem',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#9ca3af',
                                                borderRadius: '0.25rem',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteStudent(student._id, e)}
                                            style={{
                                                padding: '0.375rem',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#9ca3af',
                                                borderRadius: '0.25rem',
                                                transition: 'color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div style={{ marginLeft: '0.25rem', color: '#d1d5db' }}>
                                            {expandedStudentId === student._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {expandedStudentId === student._id && (
                                    <div style={{
                                        padding: '1rem 1rem 1rem 4.5rem', // Indent to align with text
                                        borderTop: '1px solid #f3f4f6',
                                        backgroundColor: '#ffffff'
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                            {/* Details Column */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Mail size={14} style={{ color: '#9ca3af' }} />
                                                    <span>{student.email}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Phone size={14} style={{ color: '#9ca3af' }} />
                                                    <span>{student.phone}</span>
                                                </div>
                                                {student.address && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <MapPin size={14} style={{ color: '#9ca3af' }} />
                                                        <span>{student.address}</span>
                                                    </div>
                                                )}
                                                {student.school && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <School size={14} style={{ color: '#9ca3af' }} />
                                                        <span>{student.school}</span>
                                                    </div>
                                                )}
                                                {student.joiningDate && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Calendar size={14} style={{ color: '#9ca3af' }} />
                                                        <span>Joined: {new Date(student.joiningDate).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions Column */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                <button
                                                    onClick={() => navigate('/teacher/analytics')}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: 'white',
                                                        color: '#0ea5e9',
                                                        border: '1px solid #bae6fd',
                                                        borderRadius: '0.375rem',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        fontSize: '0.875rem',
                                                        width: '100%',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                    }}
                                                >
                                                    <BarChart2 size={16} />
                                                    View Progress
                                                </button>

                                                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                                    <button
                                                        onClick={() => setEditingStudent(student)}
                                                        style={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.375rem 0.75rem',
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '0.375rem',
                                                            cursor: 'pointer',
                                                            color: '#6b7280',
                                                            fontWeight: '500',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        <Edit size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteStudent(student._id, e)}
                                                        style={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.375rem 0.75rem',
                                                            backgroundColor: 'white',
                                                            border: '1px solid #fecaca',
                                                            borderRadius: '0.375rem',
                                                            cursor: 'pointer',
                                                            color: '#ef4444',
                                                            fontWeight: '500',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {!loading && filteredStudents.length > studentsPerPage && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1.5rem',
                        padding: '1rem',
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: 'white',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Previous
                            </button>
                            
                            {/* Page number buttons */}
                            {(() => {
                                const pages = [];
                                const showEllipsisStart = currentPage > 3;
                                const showEllipsisEnd = currentPage < totalPages - 2;
                                
                                // Always show first page
                                pages.push(1);
                                
                                if (showEllipsisStart) {
                                    pages.push('...');
                                }
                                
                                // Show pages around current page
                                for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                                    if (!pages.includes(i)) {
                                        pages.push(i);
                                    }
                                }
                                
                                if (showEllipsisEnd) {
                                    pages.push('...');
                                }
                                
                                // Always show last page if more than 1 page
                                if (totalPages > 1 && !pages.includes(totalPages)) {
                                    pages.push(totalPages);
                                }
                                
                                return pages.map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} style={{ padding: '0.5rem', color: '#6b7280' }}>...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            style={{
                                                padding: '0.5rem 0.875rem',
                                                borderRadius: '0.375rem',
                                                border: currentPage === page ? 'none' : '1px solid #e5e7eb',
                                                backgroundColor: currentPage === page ? '#10b981' : 'white',
                                                cursor: 'pointer',
                                                color: currentPage === page ? 'white' : '#374151',
                                                fontSize: '0.875rem',
                                                fontWeight: currentPage === page ? '600' : '400',
                                                minWidth: '2.5rem'
                                            }}
                                        >
                                            {page}
                                        </button>
                                    )
                                ));
                            })()}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: 'white',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Assignments Section - Only shown when filtered by class */}
                {isFilteredByClass && (
                    <div ref={assignmentsSectionRef} id="assignments" style={{ marginTop: '2rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ClipboardList size={20} />
                                Class Assignments ({assignments.length})
                            </h2>
                        </div>
                        
                        {/* Assignments List - Card Grid */}
                        {loadingAssignments ? (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                padding: '2rem',
                                textAlign: 'center',
                                color: '#6b7280'
                            }}>
                                <p>Loading assignments...</p>
                            </div>
                        ) : assignments.length > 0 ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                                gap: '1rem' 
                            }}>
                                {assignments.map((assignment) => {
                                    const isActive = new Date(assignment.dueDate) >= new Date();
                                    const typeLabels = {
                                        'traditional': 'Traditional Assignment',
                                        'project-based': 'Project-Based',
                                        'quiz-assessment': 'Quiz & Assessment',
                                        'multimedia': 'Multimedia Project'
                                    };
                                    const submissionProgress = assignment.totalStudents > 0 
                                        ? (assignment.submissions / assignment.totalStudents) * 100 
                                        : 0;
                                    
                                    return (
                                        <div 
                                            key={assignment._id}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: '1rem',
                                                border: '1px solid #e5e7eb',
                                                padding: '1.5rem',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            {/* Header with Title and Status */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                <h3 style={{ fontWeight: '600', color: '#1f2937', fontSize: '1.25rem', flex: 1, paddingRight: '0.5rem' }}>
                                                    {assignment.title}
                                                </h3>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: isActive ? '#16a34a' : '#6b7280',
                                                    backgroundColor: isActive ? '#dcfce7' : '#f3f4f6',
                                                    padding: '0.375rem 0.875rem',
                                                    borderRadius: '9999px',
                                                    fontWeight: '500',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {isActive ? 'Active' : 'Draft'}
                                                </span>
                                            </div>
                                            
                                            {/* Subject */}
                                            <p style={{ fontSize: '1rem', color: '#16a34a', marginBottom: '1.25rem' }}>
                                                {assignment.subject}
                                            </p>
                                            
                                            {/* Due Date and Type Row */}
                                            <div style={{ display: 'flex', gap: '3rem', marginBottom: '1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Due Date</p>
                                                    <p style={{ fontSize: '1rem', color: '#374151', fontWeight: '500' }}>
                                                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric', 
                                                            year: 'numeric' 
                                                        }) : 'Not set'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Type</p>
                                                    <p style={{ fontSize: '1rem', color: '#374151', fontWeight: '500' }}>
                                                        {typeLabels[assignment.type] || assignment.type}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Submissions and Avg Score Row */}
                                            <div style={{ display: 'flex', gap: '3rem', marginBottom: '1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Submissions</p>
                                                    <p style={{ fontSize: '1rem', color: '#374151', fontWeight: '500' }}>
                                                        {assignment.submissions || 0}/{assignment.totalStudents || 0}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Avg Score</p>
                                                    <p style={{ fontSize: '1rem', color: '#374151', fontWeight: '500' }}>
                                                        {assignment.avgScore || 0}%
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div style={{ 
                                                height: '8px', 
                                                backgroundColor: '#e5e7eb', 
                                                borderRadius: '9999px', 
                                                marginBottom: '1.25rem',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{ 
                                                    height: '100%', 
                                                    width: `${submissionProgress}%`, 
                                                    backgroundColor: '#22c55e',
                                                    borderRadius: '9999px',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div style={{ display: 'flex', gap: '0.625rem' }}>
                                                <button
                                                    onClick={() => navigate(`/teacher/assignment/${assignment._id}/submissions?classId=${classFilter.classId}&grade=${classFilter.grade}&section=${classFilter.section}`)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.75rem',
                                                        backgroundColor: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <Eye size={18} />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/teacher/assignments/edit/${assignment._id}`)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        backgroundColor: 'white',
                                                        color: '#6b7280',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/assignment/${assignment._id}`);
                                                        alert('Assignment link copied!');
                                                    }}
                                                    style={{
                                                        padding: '0.75rem',
                                                        backgroundColor: 'white',
                                                        color: '#6b7280',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Copy size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '0.5rem',
                                border: '1px solid #e5e7eb',
                                padding: '2rem',
                                textAlign: 'center',
                                color: '#6b7280'
                            }}>
                                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p style={{ marginBottom: '0.5rem' }}>No assignments created for this class yet.</p>
                                <p style={{ fontSize: '0.875rem' }}>
                                    Click "Create Assignment" button above to create your first assignment for Grade {classFilter.grade} - Section {classFilter.section}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Student Modal */}
                {showAddModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        padding: '1rem'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Add New Student</h2>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateStudent}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newStudent.name}
                                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Roll Number *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newStudent.rollNumber}
                                            onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Class *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g., 5th-A"
                                            value={newStudent.studentClass}
                                            onChange={(e) => setNewStudent({ ...newStudent, studentClass: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={newStudent.email}
                                            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={newStudent.phone}
                                            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Address</label>
                                        <input
                                            type="text"
                                            value={newStudent.address}
                                            onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>School</label>
                                        <input
                                            type="text"
                                            value={newStudent.school}
                                            onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Joining Date</label>
                                        <input
                                            type="date"
                                            value={newStudent.joiningDate}
                                            onChange={(e) => setNewStudent({ ...newStudent, joiningDate: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem',
                                            backgroundColor: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            backgroundColor: '#059669',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Add Student
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Student Modal */}
                {editingStudent && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        padding: '1rem'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Edit Student</h2>
                                <button onClick={() => setEditingStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateStudent}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editingStudent.name}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Roll Number</label>
                                        <input
                                            type="text"
                                            value={editingStudent.rollNumber}
                                            disabled
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', backgroundColor: '#f3f4f6' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={editingStudent.email}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={editingStudent.phone}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Address</label>
                                        <input
                                            type="text"
                                            value={editingStudent.address || ''}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>School</label>
                                        <input
                                            type="text"
                                            value={editingStudent.school || ''}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, school: e.target.value })}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEditingStudent(null)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem',
                                            backgroundColor: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Import Preview Modal */}
                {showImportModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        padding: '1rem'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            width: '100%',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    <FileSpreadsheet style={{ display: 'inline', marginRight: '0.5rem' }} size={24} />
                                    Import Preview ({importData.length} students)
                                </h2>
                                <button onClick={() => { setShowImportModal(false); setImportData([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f9fafb' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Roll Number</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Class</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Phone</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>School</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importData.map((student, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '0.75rem' }}>{student.name}</td>
                                                <td style={{ padding: '0.75rem' }}>{student.rollNumber}</td>
                                                <td style={{ padding: '0.75rem' }}>{student.studentClass || '-'}</td>
                                                <td style={{ padding: '0.75rem' }}>{student.email}</td>
                                                <td style={{ padding: '0.75rem' }}>{student.phone}</td>
                                                <td style={{ padding: '0.75rem' }}>{student.school || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={() => { setShowImportModal(false); setImportData([]); }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImportStudents}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        backgroundColor: '#059669',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    <Check style={{ display: 'inline', marginRight: '0.5rem' }} size={18} />
                                    Import {importData.length} Students
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Generated Credentials Modal */}
                {showCredentialsModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        padding: '1rem'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669' }}>
                                    <CheckCircle style={{ display: 'inline', marginRight: '0.5rem' }} size={24} />
                                    Credentials Generated!
                                </h2>
                                <button onClick={() => { setShowCredentialsModal(false); setGeneratedCredentials([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                Save these credentials securely. Passwords will be hidden after the student's first login.
                            </p>
                            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f0fdf4' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Username</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Password</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatedCredentials.map((cred) => (
                                            <tr key={cred._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <td style={{ padding: '0.75rem' }}>{cred.name}</td>
                                                <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{cred.username}</td>
                                                <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                                                    {showPasswords[cred._id] ? cred.password : '••••••••'}
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => setShowPasswords(prev => ({ ...prev, [cred._id]: !prev[cred._id] }))}
                                                            style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                                                            title={showPasswords[cred._id] ? 'Hide password' : 'Show password'}
                                                        >
                                                            {showPasswords[cred._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => copyToClipboard(`Username: ${cred.username}\nPassword: ${cred.password}`, cred._id)}
                                                            style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: copiedId === cred._id ? '#059669' : '#6b7280' }}
                                                            title="Copy credentials"
                                                        >
                                                            {copiedId === cred._id ? <Check size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={downloadCredentials}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: '1px solid #059669',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'white',
                                        color: '#059669',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Download size={18} />
                                    Download CSV
                                </button>
                                <button
                                    onClick={() => { setShowCredentialsModal(false); setGeneratedCredentials([]); }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        backgroundColor: '#059669',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Student Details Modal */}
                {viewingStudent && (
                    <div 
                        onClick={(e) => {
                            // Close modal if clicking on backdrop
                            if (e.target === e.currentTarget) {
                                setViewingStudent(null);
                                setStudentDetails(null);
                            }
                        }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            padding: '1rem'
                        }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '1rem',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}>
                            {/* Modal Header */}
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                position: 'sticky',
                                top: 0,
                                backgroundColor: 'white',
                                zIndex: 10
                            }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                                    {viewingStudent.name} - Detailed Progress
                                </h2>
                                <button
                                    onClick={() => { setViewingStudent(null); setStudentDetails(null); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        padding: '0.5rem'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div style={{ padding: '1.5rem' }}>
                                {loadingDetails ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem' }}>
                                        <Loader className="animate-spin" size={32} color="#10b981" />
                                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading student details...</p>
                                    </div>
                                ) : studentDetails ? (
                                    <div>
                                        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                                            Detailed progress tracking for {viewingStudent.name} including activity history, strengths, and areas for improvement.
                                        </p>

                                        {/* Student Info Card */}
                                        <div style={{
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '0.75rem',
                                            padding: '1.25rem',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Mail size={16} style={{ color: '#10b981' }} />
                                                    <div>
                                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Email</p>
                                                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', margin: 0 }}>{studentDetails.student.email}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Phone size={16} style={{ color: '#10b981' }} />
                                                    <div>
                                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Phone</p>
                                                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', margin: 0 }}>{studentDetails.student.phone}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Calendar size={16} style={{ color: '#10b981' }} />
                                                    <div>
                                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Joining Date</p>
                                                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                                                            {new Date(studentDetails.student.joiningDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Clock size={16} style={{ color: '#10b981' }} />
                                                    <div>
                                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Last Login</p>
                                                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', margin: 0 }}>
                                                            {new Date(studentDetails.student.lastLogin).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statistics Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                borderRadius: '0.75rem',
                                                padding: '1.25rem',
                                                color: 'white'
                                            }}>
                                                <Trophy size={24} style={{ marginBottom: '0.5rem', opacity: 0.9 }} />
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{studentDetails.stats.totalPoints}</p>
                                                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Total Points</p>
                                            </div>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                borderRadius: '0.75rem',
                                                padding: '1.25rem',
                                                color: 'white'
                                            }}>
                                                <Gamepad2 size={24} style={{ marginBottom: '0.5rem', opacity: 0.9 }} />
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{studentDetails.stats.gamePoints}</p>
                                                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Game Points</p>
                                            </div>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                borderRadius: '0.75rem',
                                                padding: '1.25rem',
                                                color: 'white'
                                            }}>
                                                <BookOpen size={24} style={{ marginBottom: '0.5rem', opacity: 0.9 }} />
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{studentDetails.stats.lessonPoints}</p>
                                                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Lesson Points</p>
                                            </div>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                                                borderRadius: '0.75rem',
                                                padding: '1.25rem',
                                                color: 'white'
                                            }}>
                                                <Clock size={24} style={{ marginBottom: '0.5rem', opacity: 0.9 }} />
                                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0' }}>{studentDetails.stats.hoursLearned.toFixed(1)}h</p>
                                                <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>Hours Learned</p>
                                            </div>
                                        </div>

                                        {/* Additional Stats */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                                                <Video size={20} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0.25rem 0' }}>{studentDetails.stats.completedLessons}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Lessons</p>
                                            </div>
                                            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                                                <Target size={20} style={{ color: '#3b82f6', margin: '0 auto 0.5rem' }} />
                                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0.25rem 0' }}>{studentDetails.stats.completedQuizzes}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Quizzes</p>
                                            </div>
                                            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                                                <Gamepad2 size={20} style={{ color: '#8b5cf6', margin: '0 auto 0.5rem' }} />
                                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0.25rem 0' }}>{studentDetails.stats.gamesPlayed}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Games</p>
                                            </div>
                                            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                                                <Award size={20} style={{ color: '#f59e0b', margin: '0 auto 0.5rem' }} />
                                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0.25rem 0' }}>{studentDetails.stats.badges}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Badges</p>
                                            </div>
                                            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                                                <Zap size={20} style={{ color: '#ef4444', margin: '0 auto 0.5rem' }} />
                                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: '0.25rem 0' }}>{studentDetails.stats.streak}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Day Streak</p>
                                            </div>
                                        </div>

                                        {/* Tabs */}
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                                                    {['overview', 'lessons', 'quizzes', 'games'].map(tab => (
                                                        <button
                                                            key={tab}
                                                            onClick={() => setDetailsTab(tab)}
                                                            style={{
                                                                padding: '0.75rem 1.25rem',
                                                                background: 'none',
                                                                border: 'none',
                                                                borderBottom: detailsTab === tab ? '2px solid #10b981' : '2px solid transparent',
                                                                color: detailsTab === tab ? '#10b981' : '#6b7280',
                                                                fontWeight: detailsTab === tab ? '600' : '500',
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                textTransform: 'capitalize',
                                                                marginBottom: '-2px',
                                                                transition: 'all 0.2s',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {tab}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Overview Tab */}
                                            {detailsTab === 'overview' && (
                                                <div>
                                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Activity size={20} style={{ color: '#10b981' }} />
                                                        Recent Activity
                                                    </h3>
                                                    {studentDetails.recentActivity && studentDetails.recentActivity.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '400px', overflowY: 'auto' }}>
                                                            {studentDetails.recentActivity.map((activity, index) => (
                                                                <div key={index} style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    padding: '0.875rem',
                                                                    backgroundColor: '#f9fafb',
                                                                    borderRadius: '0.5rem',
                                                                    border: '1px solid #e5e7eb',
                                                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                        <div style={{
                                                                            width: '36px',
                                                                            height: '36px',
                                                                            borderRadius: '0.5rem',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            backgroundColor: activity.type === 'quiz' ? '#dbeafe' : activity.type === 'video' ? '#d1fae5' : '#ede9fe'
                                                                        }}>
                                                                            {activity.type === 'quiz' && <Target size={18} style={{ color: '#3b82f6' }} />}
                                                                            {activity.type === 'video' && <Video size={18} style={{ color: '#10b981' }} />}
                                                                            {activity.type === 'game' && <Gamepad2 size={18} style={{ color: '#8b5cf6' }} />}
                                                                        </div>
                                                                        <div>
                                                                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>{activity.title}</p>
                                                                            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                                                                {new Date(activity.date).toLocaleString()}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                                                        {activity.score !== undefined && (
                                                                            <span style={{
                                                                                padding: '0.375rem 0.625rem',
                                                                                backgroundColor: '#dbeafe',
                                                                                color: '#1e40af',
                                                                                borderRadius: '0.375rem',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                {activity.score}%
                                                                            </span>
                                                                        )}
                                                                        <span style={{
                                                                            padding: '0.375rem 0.625rem',
                                                                            backgroundColor: '#fef3c7',
                                                                            color: '#92400e',
                                                                            borderRadius: '0.375rem',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '600',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.25rem'
                                                                        }}>
                                                                            <Trophy size={12} />
                                                                            +{activity.points}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                                            <Activity size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                                                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No recent activity</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Lessons Tab */}
                                            {detailsTab === 'lessons' && (
                                                <div>
                                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Video size={20} style={{ color: '#10b981' }} />
                                                        Completed Lessons ({studentDetails.completedLessons?.length || 0})
                                                    </h3>
                                                    {studentDetails.completedLessons && studentDetails.completedLessons.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                                            {studentDetails.completedLessons.map((lesson, index) => (
                                                                <div key={index} style={{
                                                                    padding: '1rem',
                                                                    backgroundColor: '#ecfdf5',
                                                                    borderRadius: '0.5rem',
                                                                    border: '1px solid #a7f3d0'
                                                                }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#065f46', margin: '0 0 0.25rem 0' }}>{lesson.title}</p>
                                                                            <p style={{ fontSize: '0.75rem', color: '#047857', margin: 0 }}>{lesson.subject} • {lesson.grade}</p>
                                                                        </div>
                                                                        <span style={{
                                                                            padding: '0.375rem 0.625rem',
                                                                            backgroundColor: '#d1fae5',
                                                                            color: '#065f46',
                                                                            borderRadius: '0.375rem',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '600'
                                                                        }}>
                                                                            +{lesson.pointsEarned} pts
                                                                        </span>
                                                                    </div>
                                                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                                                        {new Date(lesson.watchedAt).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                                            <Video size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                                                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No completed lessons yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Quizzes Tab */}
                                            {detailsTab === 'quizzes' && (
                                                <div>
                                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Target size={20} style={{ color: '#3b82f6' }} />
                                                        Completed Quizzes ({studentDetails.completedQuizzes?.length || 0})
                                                    </h3>
                                                    {studentDetails.completedQuizzes && studentDetails.completedQuizzes.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                                            {studentDetails.completedQuizzes.map((quiz, index) => (
                                                                <div key={index} style={{
                                                                    padding: '1rem',
                                                                    backgroundColor: '#eff6ff',
                                                                    borderRadius: '0.5rem',
                                                                    border: '1px solid #bfdbfe'
                                                                }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#1e40af', margin: '0 0 0.25rem 0' }}>{quiz.title}</p>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                            <span style={{
                                                                                padding: '0.375rem 0.625rem',
                                                                                backgroundColor: '#dbeafe',
                                                                                color: '#1e40af',
                                                                                borderRadius: '0.375rem',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                Score: {quiz.score}%
                                                                            </span>
                                                                            <span style={{
                                                                                padding: '0.375rem 0.625rem',
                                                                                backgroundColor: '#fef3c7',
                                                                                color: '#92400e',
                                                                                borderRadius: '0.375rem',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: '600'
                                                                            }}>
                                                                                +{quiz.pointsAwarded} pts
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                                                        {new Date(quiz.completedAt).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                                            <Target size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                                                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No completed quizzes yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Games Tab */}
                                            {detailsTab === 'games' && (
                                                <div>
                                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Gamepad2 size={20} style={{ color: '#8b5cf6' }} />
                                                        Games Played ({studentDetails.gamesPlayed?.length || 0})
                                                    </h3>
                                                    {studentDetails.gamesPlayed && studentDetails.gamesPlayed.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                                            {studentDetails.gamesPlayed.map((game, index) => (
                                                                <div key={index} style={{
                                                                    padding: '1rem',
                                                                    backgroundColor: '#faf5ff',
                                                                    borderRadius: '0.5rem',
                                                                    border: '1px solid #e9d5ff'
                                                                }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#6b21a8', margin: 0 }}>{game.gameName}</p>
                                                                        </div>
                                                                        <span style={{
                                                                            padding: '0.375rem 0.625rem',
                                                                            backgroundColor: '#ede9fe',
                                                                            color: '#6b21a8',
                                                                            borderRadius: '0.375rem',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: '600'
                                                                        }}>
                                                                            +{game.pointsEarned} pts
                                                                        </span>
                                                                    </div>
                                                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                                                        {new Date(game.playedAt).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                                                            <Gamepad2 size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem' }} />
                                                            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No games played yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No data available</p>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '0.75rem',
                                position: 'sticky',
                                bottom: 0,
                                backgroundColor: 'white'
                            }}>
                                <button
                                    onClick={() => { setViewingStudent(null); setStudentDetails(null); }}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => navigate(`/teacher/student/${viewingStudent._id}`)}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManagement;
