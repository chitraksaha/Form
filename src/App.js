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
    hearAbout: '',
    company: '',
    description: '',
    solutionType: '',
    homeCapacity: '',
    commercialUnit: '',
    commercialCapacity: '',
    moduleType: '',
    moduleQuantity: ''
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
    if (!formData.hearAbout) newErrors.hearAbout = 'Please select where you heard about us';
    if (!formData.solutionType) newErrors.solutionType = 'Please select a solution type';

    if (formData.solutionType === 'Home Solution') {
      if (!formData.homeCapacity || parseFloat(formData.homeCapacity) <= 0)
        newErrors.homeCapacity = 'Please enter valid capacity in KW';
    }

    if (formData.solutionType === 'Commercial & Industrial Solutions') {
      if (!formData.commercialUnit) newErrors.commercialUnit = 'Please select a unit';
      if (!formData.commercialCapacity || parseFloat(formData.commercialCapacity) <= 0)
        newErrors.commercialCapacity = 'Please enter a valid capacity';
    }

    if (formData.solutionType === 'Only Module') {
      if (!formData.moduleType) newErrors.moduleType = 'Please select the module type';
      if (!formData.moduleQuantity || parseFloat(formData.moduleQuantity) <= 0)
        newErrors.moduleQuantity = 'Please confirm the quantity';
    }

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
        headers: { 'Content-Type': 'application/json' },
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
          ['hearAbout', 'Where did you hear about us?', 'select', [
            'Web Advertisement', 'Print Media', 'Social Media', 'Search Engine',
            'Trade Show', 'Employee Referral', 'External Referral', 'Tender',
            'Others', 'Special Projects'
          ]],
          ['company', 'Company', 'text']
        ].map(([name, label, type, options]) => (
          <div className="form-group" key={name}>
            <label htmlFor={name}>
              {label}{['salutation', 'firstName', 'lastName', 'email', 'mobile', 'country', 'zipcode', 'hearAbout'].includes(name) && <span className="required">*</span>}
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
          <label htmlFor="solutionType">What type of Solution are you looking for?<span className="required">*</span></label>
          <select name="solutionType" id="solutionType" value={formData.solutionType} onChange={handleChange}>
            <option value="">Select Solution Type</option>
            <option value="Home Solution">Home Solution</option>
            <option value="Commercial & Industrial Solutions">Commercial & Industrial Solutions</option>
            <option value="Only Module">Only Module</option>
          </select>
          {errors.solutionType && <div className="error-message">{errors.solutionType}</div>}
        </div>

        {formData.solutionType === 'Home Solution' && (
          <div className="form-group">
            <label htmlFor="homeCapacity">Capacity(KW)<span className="required">*</span></label>
            <input type="number" name="homeCapacity" id="homeCapacity" value={formData.homeCapacity} onChange={handleChange} />
            {errors.homeCapacity && <div className="error-message">{errors.homeCapacity}</div>}
          </div>
        )}

        {formData.solutionType === 'Commercial & Industrial Solutions' && (
          <>
            <div className="form-group">
              <label htmlFor="commercialUnit">Unit of Measurement<span className="required">*</span></label>
              <select name="commercialUnit" id="commercialUnit" value={formData.commercialUnit} onChange={handleChange}>
                <option value="">Select Unit</option>
                <option value="KW">KW</option>
                <option value="MW">MW</option>
              </select>
              {errors.commercialUnit && <div className="error-message">{errors.commercialUnit}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="commercialCapacity">Capacity<span className="required">*</span></label>
              <input type="number" name="commercialCapacity" id="commercialCapacity" value={formData.commercialCapacity} onChange={handleChange} />
              {errors.commercialCapacity && <div className="error-message">{errors.commercialCapacity}</div>}
            </div>
          </>
        )}

        {formData.solutionType === 'Only Module' && (
          <>
            <div className="form-group">
              <label htmlFor="moduleType">Module Type<span className="required">*</span></label>
              <select name="moduleType" id="moduleType" value={formData.moduleType} onChange={handleChange}>
                <option value="">Select Module Type</option>
                <option value="DCR">DCR</option>
                <option value="NON DCR">NON DCR</option>
              </select>
              {errors.moduleType && <div className="error-message">{errors.moduleType}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="moduleQuantity">Quantity<span className="required">*</span></label>
              <input type="number" name="moduleQuantity" id="moduleQuantity" value={formData.moduleQuantity} onChange={handleChange} />
              {errors.moduleQuantity && <div className="error-message">{errors.moduleQuantity}</div>}
            </div>
          </>
        )}

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
