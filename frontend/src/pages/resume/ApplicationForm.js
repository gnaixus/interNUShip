export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: '',
    experience: ''
  });

  const handleAutofill = (parsedData) => {
    setFormData({
      name: parsedData.name || '',
      email: parsedData.email || '',
      skills: parsedData.skills?.join(', ') || '',
      experience: parsedData.experience?.join('\n') || ''
    });
  };

  return (
    <div>
      <ResumeUpload onParse={handleAutofill} />
      
      <form>
        <input 
          value={formData.name}
          placeholder="Full Name"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        {/* Other form fields */}
      </form>
    </div>
  );
}