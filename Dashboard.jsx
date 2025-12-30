import React, { useState, useEffect } from "react";

function Dashboard({ name, email, interest, skills, studentId, onEdit }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/match/${studentId}`);
        const data = await response.json();
        setMatches(data); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching matches:", error);
        setLoading(false);
      }
    };

    if (studentId) fetchMatches();
  }, [studentId]);

  if (loading) return <div style={{color: 'black', textAlign: 'center', marginTop: '50px'}}>Fetching Live Matches...</div>;
  const highestMatchScore = matches.length > 0 
    ? Math.max(...matches.map(m => m.matchPercentage)) 
    : 0;
  return (
    <div style={{ backgroundColor: '#3c88cfff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#dbf3ff', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '700px' }}>
        
        <h1 style={{ color: '#75909c', textAlign: 'center' }}>Welcome, {name}! </h1>
        <p style={{ textAlign: 'center', color: '#555' }}>Based on your skills, here is your matching profile:</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
          {/* Profile Card */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #3f96aeff' }}>
            <h3 style={{ color: '#2160b3ff' }}>Your Profile</h3>
            <p style={{ color: 'black' }}><strong>Email:</strong> {email}</p>
            <p style={{ color: 'black' }}><strong>Interest:</strong> {interest}</p>
            <p style={{ color: 'black' }}><strong>Total Skills:</strong> {skills.length}</p>
          </div>

          {/* Job Match Score Card - Fixed to use live backend data */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #3f96aeff' }}>
            <h3 style={{ color: '#3f96aeff' }}>Top Match Score</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000' }}>
              {highestMatchScore}%
            </div>
            <p style={{ fontSize: '12px', color: 'black' }}>Highest match </p>
          </div>
        </div>

        <h3 style={{ marginTop: '30px', borderBottom: '2px solid #d6989cff', color:'#75909c'}}>Recommended for you</h3>
        
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {/* FIXED: Added 'return' and updated data paths to match backend response */}
          {matches.map((item, index) => {
            return (
              <li key={index} style={{ background: '#6b9dc6ff', margin: '15px 0', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #2160b3ff', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{item.job.title} @ {item.job.company}</strong>
                  <span style={{ fontWeight: 'bold', color: '#000', background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '5px' }}>
                    {Math.round(item.matchPercentage)}% Match
                  </span>
                </div>
                
                <div style={{ fontSize: '13px', marginTop: '8px', color: '#f0f0f0' }}>
                   {item.missingSkills.length > 0 ? (
                     <span>💡 <strong>Skills to Learn:</strong> {item.missingSkills.join(", ")}</span>
                   ) : (
                     <span>✨ You are a Perfect Match!</span>
                   )}
                </div>

                {/* Learning Resources Section */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {item.learningResources.map((res, i) => (
                    <a key={i} href={res.link} target="_blank" rel="noreferrer" 
                       style={{ background: '#ff4d4d', color: 'white', padding: '5px 10px', borderRadius: '15px', textDecoration: 'none', fontSize: '11px', fontWeight: 'bold' }}>
                      Watch {res.skillName}
                    </a>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        <button onClick={onEdit} style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default Dashboard;