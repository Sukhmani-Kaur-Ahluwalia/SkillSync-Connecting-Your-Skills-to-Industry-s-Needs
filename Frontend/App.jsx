import React, { useState } from "react";
import Dashboard from "./Dashboard";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Machine Learning");
  const [newSkill, setNewSkill] = useState("");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [skills, setskills] = useState([
    { skillName: "React", level: "Intermediate" },
    { skillName: "Python", level: "Advanced" }
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const PRESET_SKILLS = ["React", "Python", "Java", "JavaScript", "UI/UX", "Tailwind CSS", "C++", "MongoDB","Node.js","SQL","Financial Modelling","Data Warehousing","AWS Cloud"];
  const addNewSkillToList = () => {
    if (newSkill === "") {
      alert("Please select a skill");
      return;
    }
    const isDuplicate = skills.some((s) => s.skillName.toLowerCase() === newSkill.toLowerCase());
    if (isDuplicate) {
      alert("Sorry, Duplicate Entry");
    } else {
      setskills([...skills, { skillName: newSkill, level: skillLevel }]);
      setNewSkill("");
      setSkillLevel("Intermediate");
    }
  };

  const deleteSkill = (indexToDelete) => {
    const updatedSkills = skills.filter((_, index) => index !== indexToDelete);
    setskills(updatedSkills);
  };

  const handleCompleteOnboarding = async () => {
    if (!name || !email) {
      alert("Please enter Name and Email!");
      return;
    }
    const studentData = { name, email, interests: [interest], skills };

    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(`Great! ${name} 's Form submitted to Database.`);
        setStudentId(result._id);
        setIsSubmitted(true);
      } else {
        alert("Server Error!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Not connected to backend!");
    }
  };

  if (isSubmitted) {
    return (
      <Dashboard 
        name={name} 
        email={email} 
        interest={interest} 
        skills={skills} 
        studentId={studentId}
        onEdit={() => setIsSubmitted(false)} 
      />
    );
  }

  return (
    <div style={{ backgroundColor: '#D1B4C6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      {/* Width ko 90% aur maxWidth ko 1000px kiya taaki wide dikhe */}
      <div style={{ backgroundColor: '#EFE1E1', padding: '50px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(60, 85, 136, 0.2)', width: '90%', maxWidth: '1000px' }}>
        <h1 style={{ color: '#d6989cff', marginBottom: '20px', textAlign: 'center', fontSize: '2.5rem' }}>SkillSync</h1>
        
        {/* Form elements ko wide screen par balance karne ke liye grid daal sakte hain par maine waisa hi rakha hai jaisa aapne manga */}
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Full Name</label>
        <input type="text" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', background:'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }} />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Email</label>
        <input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value) } style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', background:'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }} />

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Interest</label>
        <select value={interest} onChange={(e) => setInterest(e.target.value)} style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box', backgroundColor: 'white' }}>
          <option value="Machine Learning">Machine Learning</option>
          <option value="Web Development">Web Development</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="Data Science">Data Science</option>
        </select>

        <label style={{ color:'#141515ff', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Select Skill & Level</label>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <select value={newSkill} onChange={(e) => setNewSkill(e.target.value)} style={{ flex: 3, padding: '15px', borderRadius: '8px', border: '1px solid #100101ff', backgroundColor: 'white', color:'black' }}>
            <option value="">-- Skill --</option>
            {PRESET_SKILLS.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
          </select>
          {newSkill && (
            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} style={{ flex: 2, padding: '15px', borderRadius: '8px', border: '1px solid #100101ff', backgroundColor: '#fff', color:'black' }}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          )}
          <button onClick={addNewSkillToList} style={{ backgroundColor: '#2160b3ff', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Add Skill
          </button>
        </div>

        <h3 style={{ borderBottom: '2px solid #3f96aeff', paddingBottom: '10px' ,color:'#141515ff' }}>Your Skills</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {skills.map((s, index) => (
            <li key={index} style={{ color:'black', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#EFE1E1', marginBottom: '10px', border: '1px solid #141111ff', borderRadius: '6px' }}>
              <span><strong>{s.skillName}</strong> - {s.level}</span>
              <button onClick={() => deleteSkill(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem' }}>✕</button>
            </li>
          ))}
        </ul>

        <button onClick={handleCompleteOnboarding} style={{ width: '100%', padding: '20px', marginTop: '30px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
          Complete Onboarding
        </button>
      </div>
    </div>
  );
}

export default App;