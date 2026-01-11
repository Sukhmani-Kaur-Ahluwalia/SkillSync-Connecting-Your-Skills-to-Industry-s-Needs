import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Auth from "./Auth";

function App() {
  const [student, setStudent] = useState(null);
  const [showAuth, setShowAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false); // Track if it's a new user registration
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Machine Learning");
  const [newSkill, setNewSkill] = useState("");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [skills, setskills] = useState([
    { skillName: "React", level: "Intermediate" },
    { skillName: "Python", level: "Advanced" }
  ]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Check if student is logged in on component mount
  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    const storedStudentId = localStorage.getItem('studentId');
    if (storedStudent && storedStudentId) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      setStudentId(storedStudentId);
      setEmail(studentData.email);
      setName(studentData.name);
      if (studentData.skills && studentData.skills.length > 0) {
        setskills(studentData.skills);
      }
      if (studentData.interests && studentData.interests.length > 0) {
        setInterest(studentData.interests[0]);
      }
      setShowAuth(false);
      setIsSubmitted(true); // Show dashboard directly if student exists
    }
  }, []);

  const handleLogin = (studentData) => {
    setStudent(studentData);
    setStudentId(studentData.id);
    setEmail(studentData.email);
    setName(studentData.name);
    if (studentData.skills && studentData.skills.length > 0) {
      setskills(studentData.skills);
    }
    if (studentData.interests && studentData.interests.length > 0) {
      setInterest(studentData.interests[0]);
    }
    // Check if student has complete profile (has skills/interests)
    if (studentData.skills && studentData.skills.length > 0 && studentData.interests && studentData.interests.length > 0) {
      // Complete profile - show dashboard
      setIsSubmitted(true);
      setShowAuth(false);
      setShowOnboarding(false);
      setShowProfileSetup(false);
    } else {
      // Incomplete profile - show profile setup
      setShowProfileSetup(true);
      setShowAuth(false);
      setShowOnboarding(false);
    }
  };

  const handleCreateAccount = () => {
    setShowAuth(false);
    setShowOnboarding(true);
    setIsNewUser(true); // Mark as new user registration
  };

  const handleBack = () => {
    if (isNewUser) {
      // If new user, go back to email login page
      setShowAuth(true);
      setShowOnboarding(false);
      setIsNewUser(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setskills([
        { skillName: "React", level: "Intermediate" },
        { skillName: "Python", level: "Advanced" }
      ]);
    } else {
      // If editing existing profile, go back to dashboard
      setIsSubmitted(true);
      setShowOnboarding(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('student');
    localStorage.removeItem('studentId');
    setStudent(null);
    setName("");
    setEmail("");
    setIsSubmitted(false);
    setStudentId(null);
    setShowAuth(true);
    setShowOnboarding(false);
    setIsNewUser(false);
    setskills([
      { skillName: "React", level: "Intermediate" },
      { skillName: "Python", level: "Advanced" }
    ]);
  };
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
    
    // Password validation for new users only
    if (isNewUser) {
      if (!password || !confirmPassword) {
        alert("Please enter and confirm your password!");
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
    }
    
    // For new users, only send basic info (no interests/skills yet)
    // For existing users, send all profile data
    const studentData = isNewUser 
      ? { name, email, password } // New user - just basic info
      : { name, interests: [interest], skills }; // Existing user - full profile update

    try {
      let response;
      if (isNewUser) {
        // Create new student with password
        response = await fetch('http://localhost:5000/api/students', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(studentData),
        });
      } else {
        // Update existing student (no password)
        response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            interests: [interest],
            skills
          }),
        });
      }
      
      const result = await response.json();
      if (response.ok) {
        if (isNewUser) {
          // New user registration - show success and profile setup page
          alert("Account created successfully! Now complete your profile.");
          setStudentId(result._id);
          localStorage.setItem('student', JSON.stringify(result));
          localStorage.setItem('studentId', result._id);
          setStudent(result);
          setShowOnboarding(false);
          setShowProfileSetup(true); // Show profile completion page
          setIsNewUser(false);
          // Reset skills for fresh start
          setskills([]);
        } else {
          // Existing user updating profile
          alert(`Great! ${name}'s profile has been updated.`);
          setStudentId(result._id);
          localStorage.setItem('student', JSON.stringify(result));
          localStorage.setItem('studentId', result._id);
          setStudent(result);
          setIsSubmitted(true);
          setShowOnboarding(false);
        }
      } else {
        alert("Server Error: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Not connected to backend!");
    }
  };

  // Show email login page if not authenticated
  if (showAuth) {
    return <Auth onLogin={handleLogin} onCreateAccount={handleCreateAccount} />;
  }

  // Show dashboard if student is logged in and has profile
  if (isSubmitted && studentId) {
    return (
      <Dashboard 
        name={name} 
        email={email} 
        interest={interest} 
        skills={skills} 
        studentId={studentId}
        onEdit={() => {
          setIsSubmitted(false);
          setShowOnboarding(true);
          setIsNewUser(false); // Mark as editing existing profile, not new user
        }}
        onLogout={handleLogout}
      />
    );
  }

  // Show simple registration form for new users
  if (showOnboarding && isNewUser) {
    return (
      <div style={{ backgroundColor: '#D1B4C6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#EFE1E1', padding: '50px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(60, 85, 136, 0.2)', width: '90%', maxWidth: '500px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
            <button
              onClick={handleBack}
              style={{
                padding: '10px 20px',
                backgroundColor: '#d6989cff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Back
            </button>
          </div>
          <h1 style={{ color: '#d6989cff', marginBottom: '20px', textAlign: 'center', fontSize: '2.5rem' }}>SkillSync</h1>
          <p style={{ textAlign: 'center', color: '#141515ff', marginBottom: '30px' }}>Create Your Account</p>
        
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Full Name</label>
          <input 
            type="text" 
            placeholder="Enter Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', background:'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }} 
            required
          />

          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Email</label>
          <input 
            type="email" 
            placeholder="Enter Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', background:'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }} 
            required
          />

          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Password</label>
          <input 
            type="password" 
            placeholder="Enter Password (min 6 characters)" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', background:'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }} 
            minLength={6}
            required
          />

          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Confirm Password</label>
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', background:'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }} 
            minLength={6}
            required
          />

          <button onClick={handleCompleteOnboarding} style={{ width: '100%', padding: '20px', marginTop: '30px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // Show profile completion page (for new users after registration)
  if (showProfileSetup && studentId) {
    return (
      <div style={{ backgroundColor: '#D1B4C6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#EFE1E1', padding: '50px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(60, 85, 136, 0.2)', width: '90%', maxWidth: '1000px', position: 'relative' }}>
          <h1 style={{ color: '#d6989cff', marginBottom: '20px', textAlign: 'center', fontSize: '2.5rem' }}>SkillSync</h1>
          <p style={{ textAlign: 'center', color: '#141515ff', marginBottom: '30px' }}>Complete Your Profile</p>
        
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

          <button onClick={async () => {
            try {
              // Validate that at least one skill is added
              if (skills.length === 0) {
                alert("Please add at least one skill to your profile!");
                return;
              }
              
              const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name,
                  interests: [interest],
                  skills
                }),
              });
              const result = await response.json();
              if (response.ok) {
                // Update localStorage with complete profile
                const updatedStudentId = result._id || result.id || studentId;
                localStorage.setItem('student', JSON.stringify(result));
                localStorage.setItem('studentId', updatedStudentId);
                setStudentId(updatedStudentId);
                setStudent(result);
                setskills(result.skills || []);
                if (result.interests && result.interests.length > 0) {
                  setInterest(result.interests[0]);
                }
                // Show success message
                alert("Profile saved successfully! Welcome to SkillSync!");
                // Navigate to dashboard
                setShowProfileSetup(false);
                setIsSubmitted(true);
              } else {
                alert("Error saving profile: " + (result.error || "Unknown error"));
              }
            } catch (error) {
              console.error("Error:", error);
              alert("Network error. Please check if the backend is running.");
            }
          }} style={{ width: '100%', padding: '20px', marginTop: '30px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
            Save Profile
          </button>
        </div>
      </div>
    );
  }

  // Show edit profile form for existing users
  if (showOnboarding && !isNewUser) {
    return (
      <div style={{ backgroundColor: '#D1B4C6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#EFE1E1', padding: '50px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(60, 85, 136, 0.2)', width: '90%', maxWidth: '1000px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
            <button
              onClick={handleBack}
              style={{
                padding: '10px 20px',
                backgroundColor: '#d6989cff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Back to Dashboard
            </button>
          </div>
          <h1 style={{ color: '#d6989cff', marginBottom: '20px', textAlign: 'center', fontSize: '2.5rem' }}>SkillSync</h1>
          <p style={{ textAlign: 'center', color: '#141515ff', marginBottom: '30px' }}>Edit Your Profile</p>
        
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Full Name</label>
          <input 
            type="text" 
            placeholder="Enter Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', background:'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }} 
          />

          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color:'#141515ff' }}>Email</label>
          <input 
            type="email" 
            placeholder="Enter Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={true}
            style={{ width: '100%', padding: '15px', marginBottom: '20px', color:'black', background:'#f5f5f5', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }} 
          />

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
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  // Default return (should not reach here)
  return null;
}

export default App;
