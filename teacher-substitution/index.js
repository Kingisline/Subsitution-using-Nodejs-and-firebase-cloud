const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Firebase
const serviceAccount = require("./serviceKey.json"); // Your Firebase key file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://password-manager-3d4a4-default-rtdb.firebaseio.com/", // Replace with your Firebase URL
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Teacher Substitution API is running...");
});

app.get("/get-teachers", async (req, res) => {
  try {
    const snapshot = await db.collection("teachers").get();
    const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/mark-absent", async (req, res) => {
  const { teacherId, date } = req.body;

  try {
    await db.collection("absences").add({ teacherId, date, status: "Absent" });

    // Set teacher as unavailable
    await db.collection("teachers").doc(teacherId).update({ available: false });

    res.status(200).json({ message: "Teacher marked absent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/assign-substitute", async (req, res) => {
  try {
      const { teacherId, date } = req.body;

      // Get the absent teacher's details
      const absentTeacherRef = db.collection("teachers").doc(teacherId);
      const absentTeacher = await absentTeacherRef.get();

      if (!absentTeacher.exists) {
          return res.status(404).json({ message: "Teacher not found" });
      }

      const subject = absentTeacher.data().subject;

      // Find available teachers for the same subject
      const teachersSnapshot = await db.collection("teachers")
          .where("subject", "==", subject)
          .where("available", "==", true)
          .get();

      const availableTeachers = teachersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(t => t.id !== teacherId); // Exclude the absent teacher

      if (availableTeachers.length === 0) {
          return res.status(400).json({ message: "No substitutes available" });
      }

      // Pick a random available teacher
      const substitute = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];

      // Mark substitute as assigned
      await db.collection("substitutions").add({
          absentTeacher: teacherId,
          substituteTeacher: substitute.id,
          subject: subject,
          date: date
      });

      res.status(200).json({
          message: `Substitute assigned: ${substitute.name}`,
          substitute
      });

  } catch (error) {
      console.error("Error assigning substitute:", error);
      res.status(500).json({ error: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



