
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
  });

  // Load students from MongoDB
  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load students.");
        }

        const data = await response.json();

        setStudents(
          data.map((student) => ({
            ...student,
            id: student._id,
          }))
        );
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  // Search students
  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.email} ${student.course}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Sidebar navigation
  function navigateToSection(sectionId) {
    setActiveSection(sectionId);

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Open Add Student form
  function openAddForm() {
    setEditingId(null);
    setForm({ name: "", email: "", course: "" });
    setShowForm(true);
    setMessage("");
  }

  // Open Edit Student form
  function openEditForm(student) {
    setEditingId(student.id);

    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
    });

    setShowForm(true);
    setMessage("");
  }

  // Add or Update student in MongoDB
  async function saveStudent(event) {
    event.preventDefault();

    const cleanForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      course: form.course.trim(),
    };

    if (!cleanForm.name || !cleanForm.email || !cleanForm.course) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      const savedStudent = {
        ...data,
        id: data._id,
      };

      if (isEditing) {
        setStudents((previous) =>
          previous.map((student) =>
            student.id === editingId ? savedStudent : student
          )
        );

        setSelectedStudent((previous) =>
          previous?.id === editingId ? savedStudent : previous
        );

        setMessage("Student updated successfully!");
      } else {
        setStudents((previous) => [
          savedStudent,
          ...previous,
        ]);

        setMessage("Student added successfully!");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", email: "", course: "" });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  // Delete student from MongoDB
  async function deleteStudent(id) {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete student.");
      }

      setStudents((previous) =>
        previous.filter((student) => student.id !== id)
      );

      if (selectedStudent?.id === id) {
        setSelectedStudent(null);
      }

      setMessage("Student deleted successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">S</span>
          Student<span className="brand-highlight">Hub</span>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <a
          href="#dashboard"
          className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
          onClick={(event) => {
            event.preventDefault();
            navigateToSection("dashboard");
          }}
        >
          <span aria-hidden="true">▦</span> &nbsp; Dashboard
        </a>

        <a
          href="#students"
          className={`nav-item ${activeSection === "students" ? "active" : ""}`}
          onClick={(event) => {
            event.preventDefault();
            navigateToSection("students");
          }}
        >
          <span aria-hidden="true">♙</span> &nbsp; Students
        </a>

        <a
          href="#recent"
          className={`nav-item ${activeSection === "recent" ? "active" : ""}`}
          onClick={(event) => {
            event.preventDefault();
            navigateToSection("recent");
          }}
        >
          <span aria-hidden="true">◷</span> &nbsp; Recent Registrations
        </a>

        <div className="sidebar-bottom">
          <div className="admin-avatar">A</div>
          <div>
            <strong>Administrator</strong>
            <small>Student Management</small>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
          </div>
          <div className="profile-avatar">A</div>
        </header>

        <section className="welcome-banner">
          <div>
            <span className="welcome-tag">
              STUDENT MANAGEMENT SYSTEM
            </span>

            <h2>Welcome back, Administrator!</h2>

            <p>
              Manage student records and keep everything organised.
            </p>

            <button className="primary-button" onClick={openAddForm}>
              + Add New Student
            </button>
          </div>

          <div className="banner-art" aria-hidden="true">
            🎓
          </div>
        </section>

        {message && (
          <div className="message" role="status">
            {message}
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setMessage("")}
            >
              ×
            </button>
          </div>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon purple">♙</div>
            <p>Total Students</p>
            <h3>{students.length}</h3>
            <small>Student records</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Active Students</p>
            <h3>{students.length}</h3>
            <small>Currently registered</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon orange">◷</div>
            <p>Recent Registrations</p>
            <h3>{Math.min(students.length, 5)}</h3>
            <small>Latest student records</small>
          </article>

          <article className="stat-card">
            <div className="stat-icon blue">▤</div>
            <p>Courses</p>
            <h3>
              {new Set(students.map((student) => student.course)).size}
            </h3>
            <small>Unique courses</small>
          </article>
        </section>

        <section className="student-section" id="students">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STUDENT DIRECTORY</p>
              <h2>All Students</h2>
            </div>

            <button className="primary-button" onClick={openAddForm}>
              + Add Student
            </button>
          </div>

          <div className="table-toolbar">
            <input
              className="search-input"
              type="search"
              placeholder="Search by name, email or course..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <span className="result-count">
              {filteredStudents.length} records
            </span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>COURSE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      Loading students...
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {student.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <strong>{student.name}</strong>
                              <small>{student.email}</small>
                            </div>
                          </div>
                        </td>

                        <td>{student.course}</td>

                        <td>
                          <span className="status active">Active</span>
                        </td>

                        <td>
                          <div className="actions">
                            <button
                              className="action view"
                              onClick={() => setSelectedStudent(student)}
                            >
                              View
                            </button>

                            <button
                              className="action edit"
                              onClick={() => openEditForm(student)}
                            >
                              Edit
                            </button>

                            <button
                              className="action delete"
                              onClick={() => deleteStudent(student.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          No students found.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="recent-section" id="recent">
          <p className="eyebrow">LATEST ACTIVITY</p>
          <h2>Recent Registrations</h2>

          {students.slice(0, 5).map((student) => (
            <div className="recent-item" key={student.id}>
              <div className="student-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>

              <div className="recent-info">
                <strong>{student.name}</strong>
                <small>{student.course}</small>
              </div>

              <span className="status active">Registered</span>
            </div>
          ))}

          {!loading && students.length === 0 && (
            <p>No registrations yet.</p>
          )}
        </section>

        <footer className="footer">
          StudentHub · Student Management System
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>
                {editingId !== null ? "Edit Student" : "Add New Student"}
              </h2>

              <button
                type="button"
                className="close-button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveStudent}>
              <label>
                Full Name
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter student name"
                />
              </label>

              <label>
                Email Address
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="student@example.com"
                />
              </label>

              <label>
                Course
                <input
                  required
                  value={form.course}
                  onChange={(event) =>
                    setForm({ ...form, course: event.target.value })
                  }
                  placeholder="Enter course name"
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>Student Details</h2>

              <button
                type="button"
                className="close-button"
                aria-label="Close student details"
                onClick={() => setSelectedStudent(null)}
              >
                ×
              </button>
            </div>

            <div className="detail-avatar">
              {selectedStudent.name.charAt(0).toUpperCase()}
            </div>

            <h3>{selectedStudent.name}</h3>
            <p>{selectedStudent.email}</p>

            <div className="detail-row">
              <span>Course</span>
              <strong>{selectedStudent.course}</strong>
            </div>

            <div className="detail-row">
              <span>Student ID</span>
              <strong>{selectedStudent.id}</strong>
            </div>

            <button
              className="primary-button full-button"
              onClick={() => setSelectedStudent(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
