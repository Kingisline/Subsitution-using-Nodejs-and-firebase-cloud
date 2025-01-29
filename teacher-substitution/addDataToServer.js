const admin = require("firebase-admin");
const serviceAccount = require("./serviceKey.json"); // Your Firebase credentials

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Function to add teachers
async function addTeachers() {
  const teachers = [
    { name: "Gershon", subject: "Math", available: true },
    { name: "paul", subject: "Social", available: true },
    { name: "Eby", subject: "Science", available: true }
  ];

  for (let teacher of teachers) {
    await db.collection("teachers").add(teacher);
  }

  console.log("Teachers added successfully!");
}

addTeachers();