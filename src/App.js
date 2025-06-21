import React, { useState } from 'react';
import './App.css';

function App() {
  const initialValues = {
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    country: '',
    zipcode: '',
    units: '',
    quantity: '',
    hearAbout: '',
    company: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.salutation) newErrors.salutation = 'Please select a salutation';
    if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName)) newErrors.firstName = 'First name cannot contain numbers or special characters';
    if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName)) newErrors.lastName = 'Last name cannot contain numbers or special characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!/^\d{10,15}$/.test(formData.mobile)) newErrors.mobile = 'Please enter a valid mobile number (10-15 digits)';
    if (!/^[a-zA-Z\s'-]+$/.test(formData.country)) newErrors.country = 'Country cannot contain numbers or special characters';
    if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(formData.zipcode)) newErrors.zipcode = 'Please enter a valid zipcode';
    if (!formData.units) newErrors.units = 'Please select units of measurement';
    if (!formData.quantity || parseFloat(formData.quantity) < 0) newErrors.quantity = 'Please enter a valid positive quantity';
    if (!formData.hearAbout) newErrors.hearAbout = 'Please select where you heard about us';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://xl9cdzpsid.execute-api.us-west-2.amazonaws.com/dev/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      console.log('Lambda response:', result);

      setSubmitted(true);
      setFormData(initialValues);
      setErrors({});
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };


  console.log('Form Data:', formData);

  return (
    <div className="form-container">
      <h2 className="form-title">Authentication</h2>
      <form onSubmit={handleSubmit} noValidate>
        {[
          ['salutation', 'Salutation', 'select', ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.']],
          ['firstName', 'First Name', 'text'],
          ['lastName', 'Last Name', 'text'],
          ['email', 'Email', 'email'],
          ['mobile', 'Mobile Number', 'tel'],
          ['country', 'Country', 'text'],
          ['zipcode', 'Zipcode', 'text'],
          ['units', 'Units of Measurement', 'select', ['KW', 'MW', 'NOS']],
          ['quantity', 'Quantity', 'number'],
          ['hearAbout', 'Where did you hear about us?', 'select', [
            'Web Advertisement', 'Print Media', 'Social Media', 'Search Engine',
            'Trade Show', 'Employee Referral', 'External Referral', 'Tender',
            'Others', 'Special Projects'
          ]],
          ['company', 'Company', 'text'],
        ].map(([name, label, type, options]) => (
          <div className="form-group" key={name}>
            <label htmlFor={name}>
              {label}{['salutation', 'firstName', 'lastName', 'email', 'mobile', 'country', 'zipcode', 'units', 'quantity', 'hearAbout'].includes(name) && <span className="required">*</span>}
            </label>
            {type === 'select' ? (
              <select name={name} id={name} value={formData[name]} onChange={handleChange}>
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type={type} name={name} id={name} value={formData[name]} onChange={handleChange} />
            )}
            {errors[name] && <div className="error-message">{errors[name]}</div>}
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} placeholder="Tell us more about your inquiry..."></textarea>
        </div>

        <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>

      {submitted && (
        <div className="form-success">
          <strong>Success!</strong> Your form has been submitted successfully. We'll get back to you soon.
        </div>
      )}
    </div>
  );
}

export default App;
