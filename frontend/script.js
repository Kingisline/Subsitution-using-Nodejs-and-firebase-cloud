const API_URL = "http://localhost:5000"; // Change this if backend is hosted elsewhere

// Function to fetch and display teachers
async function loadTeachers() {
    const response = await fetch(`${API_URL}/get-teachers`);
    const teachers = await response.json();

    const tbody = document.querySelector("#teacherTable tbody");
    tbody.innerHTML = ""; // Clear previous entries

    teachers.forEach(teacher => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${teacher.name}</td>
            <td>${teacher.subject}</td>
            <td>${teacher.available ? "✅ Yes" : "❌ No"}</td>
            <td>
                <button class="absent-btn" onclick="markAbsent('${teacher.id}')">Mark Absent</button>
                <button class="substitute-btn" onclick="assignSubstitute('${teacher.id}')">Assign Substitute</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Mark a teacher as absent
async function markAbsent(teacherId) {
    const date = new Date().toISOString().split("T")[0]; // Get current date
    const response = await fetch(`${API_URL}/mark-absent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, date })
    });

    const result = await response.json();
    alert(result.message);
    loadTeachers(); // Reload teachers after update
}

// Assign a substitute
async function assignSubstitute(teacherId) {
    const date = new Date().toISOString().split("T")[0]; // Get current date
    const response = await fetch(`${API_URL}/assign-substitute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, date })
    });

    const result = await response.json();
    alert(result.message);
    loadTeachers(); // Reload teachers after update
}

// Load teachers on page load
window.onload = loadTeachers;
