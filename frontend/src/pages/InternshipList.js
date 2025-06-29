// for milestone 2 

// // import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./InternshipList.css"; // Import the CSS file

// export default function InternshipList() {
//   const [internships, setInternships] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get("http://localhost:8000/internships");
//         setInternships(response.data);
//       } catch (err) {
//         setError("Failed to load internships. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) return <p className="loading-text">Loading...</p>;
//   if (error) return <p className="error-text">{error}</p>;

//   return (
//     <div className="internship-container">
//       <h1 className="internship-header">Internship Opportunities</h1>
//       <div className="internship-grid">
//         {internships.map((job) => (
//           <div key={job.id} className="internship-card">
//             <h3 className="internship-title">{job.title}</h3>
//             <p className="internship-company">{job.company}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }