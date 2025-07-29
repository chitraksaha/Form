import React, { useState } from 'react';
import './App.css';

function SuccessPage({ onGoBack }) {
  return (
    <div className="form-container success-page-container">
      <h2 className="form-title">Thank You!</h2>
      <div className="form-success" style={{ display: 'block', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>
          Your form has been submitted successfully.
        </p>
        <p>We appreciate you taking the time to fill it out.</p>
      </div>
      <button
        onClick={onGoBack}
        className="submit-btn"
        style={{ marginTop: '30px', backgroundColor: '#28a745' }}
      >
        Submit Another Response
      </button>
    </div>
  );
}

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
  const [loading, setLoading] = useState(false);
  const [globalErrorMessage, setGlobalErrorMessage] = useState('');
  const [showSuccessPage, setShowSuccessPage] = useState(false);

  const place_holder_lables = {
    salutation: 'eg: Mr.',
    firstName: 'eg: Vikram',
    lastName: 'eg: Roy',
    email: 'eg: roy@gmail.com',
    mobile: 'eg: 9998887770',
    country: 'eg: India',
    zipcode: 'eg: 700215',
    hearAbout: 'eg: Search Engine'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setGlobalErrorMessage('');
  };

  const validate = async () => {
    const newErrors = {};

    if (!formData.salutation) newErrors.salutation = 'Please select a salutation';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.zipcode.trim()) newErrors.zipcode = 'Zipcode is required';
    if (!formData.hearAbout) newErrors.hearAbout = 'Please select where you heard about us';
    if (!formData.solutionType) newErrors.solutionType = 'Please select a solution type';

    if (formData.firstName.trim() && !/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) newErrors.firstName = 'Invalid Entry. Enter only characters.';
    if (formData.lastName.trim() && !/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) newErrors.lastName = 'Invalid Entry. Enter only characters';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = 'Invalid Entry. Enter a valid email ID.';
    if (formData.mobile.trim() && !/^\d{10,15}$/.test(formData.mobile.trim())) newErrors.mobile = 'Invalid Entry. Enter valid 10-digit mobile number.';
    if (formData.country.trim() && !/^[a-zA-Z\s-]+$/.test(formData.country.trim())) newErrors.country = 'Invalid Entry. Enter only characters';
    if (formData.zipcode.trim() && !/^\d{6}$/.test(formData.zipcode.trim())) newErrors.zipcode = 'Invalid Entry. Enter a valid 6-digit pincode.';

    if (formData.solutionType === 'Home Solution') {
      if (!formData.homeCapacity || parseFloat(formData.homeCapacity) <= 0)
        newErrors.homeCapacity = 'Invalid Entry. Enter only numbers';
    }

    if (formData.solutionType === 'Commercial & Industrial Solutions') {
      if (!formData.commercialUnit) newErrors.commercialUnit = 'Please select a unit';
      if (!formData.commercialCapacity || parseFloat(formData.commercialCapacity) <= 0)
        newErrors.commercialCapacity = 'Invalid Entry. Enter only numbers.';
    }

    if (formData.solutionType === 'Only Module') {
      if (!formData.moduleType) newErrors.moduleType = 'Please select the module type';
      if (!formData.moduleQuantity || parseFloat(formData.moduleQuantity) <= 0)
        newErrors.moduleQuantity = 'Invalid Entry. Enter only numbers.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalErrorMessage('');
    setErrors({});

    const newErrors = await validate();

    if (Object.keys(newErrors).length > 0) {
      const clearedData = { ...formData };
      for (const fieldName in newErrors) {
        if (initialValues.hasOwnProperty(fieldName)) {
          const fieldElement = document.getElementById(fieldName);
          if (fieldElement && (fieldElement.tagName === 'INPUT' || fieldElement.tagName === 'TEXTAREA')) {
            clearedData[fieldName] = initialValues[fieldName];
          }
        }
      }
      setErrors(newErrors);
      setGlobalErrorMessage('Invalid Entry');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://xl9cdzpsid.execute-api.us-west-2.amazonaws.com/dev/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.status === 409 || response.status === 400) {
        const message = result.message || '';
        const isDuplicate = message.toLowerCase().includes('duplicate');

        const duplicateFieldErrors = {};
        if (isDuplicate) {
          duplicateFieldErrors.email = 'Duplicate lead found';
          duplicateFieldErrors.mobile = 'Duplicate lead found';
        }

        setErrors(prev => ({ ...prev, ...duplicateFieldErrors }));
        setGlobalErrorMessage('Duplicate lead found');
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      setFormData(initialValues);
      setErrors({});
      setGlobalErrorMessage('');
      setShowSuccessPage(true);

    } catch (error) {
      console.error('Submission error:', error);
      setGlobalErrorMessage('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBackToForm = () => {
    setShowSuccessPage(false);
  };

  return showSuccessPage ? (
    <SuccessPage onGoBack={handleGoBackToForm} />
  ) : (
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
            'Others'
          ]],
          ['company', 'Company', 'text']
        ].map(([name, label, type, options]) => (
          <div className="form-group" key={name}>
            <label htmlFor={name}>
              {label}
              {['salutation', 'firstName', 'lastName', 'email', 'mobile', 'country', 'zipcode', 'hearAbout'].includes(name) && <span className="required">*</span>}
            </label>
            {type === 'select' ? (
              <select
                name={name}
                id={name}
                value={formData[name]}
                onChange={handleChange}
                className={errors[name] ? 'error' : ''}
              >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <>
                <input
                  type={type}
                  name={name}
                  id={name}
                  placeholder={place_holder_lables[name]}
                  value={formData[name]}
                  onChange={handleChange}
                  className={errors[name] ? 'error' : ''}
                />
                {errors[name] && (
                  <div style={{
                    color: '#e74c3c',
                    fontSize: '12px',
                    marginTop: '5px',
                    display: 'block',
                  }}>{errors[name]}</div>
                )}
              </>
            )}
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="solutionType">What type of Solution are you looking for?<span className="required">*</span></label>
          <select
            name="solutionType"
            id="solutionType"
            value={formData.solutionType}
            onChange={handleChange}
            className={errors.solutionType ? 'error' : ''}
          >
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
            <input
              type="number"
              name="homeCapacity"
              id="homeCapacity"
              value={formData.homeCapacity}
              onChange={handleChange}
              className={errors.homeCapacity ? 'error' : ''}
            />
            {errors.homeCapacity && <div className="error-message">{errors.homeCapacity}</div>}
          </div>
        )}

        {formData.solutionType === 'Commercial & Industrial Solutions' && (
          <>
            <div className="form-group">
              <label htmlFor="commercialUnit">Unit of Measurement<span className="required">*</span></label>
              <select
                name="commercialUnit"
                id="commercialUnit"
                value={formData.commercialUnit}
                onChange={handleChange}
                className={errors.commercialUnit ? 'error' : ''}
              >
                <option value="">Select Unit</option>
                <option value="KW">KW</option>
                <option value="MW">MW</option>
              </select>
              {errors.commercialUnit && <div className="error-message">{errors.commercialUnit}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="commercialCapacity">Capacity<span className="required">*</span></label>
              <input
                type="number"
                name="commercialCapacity"
                id="commercialCapacity"
                value={formData.commercialCapacity}
                onChange={handleChange}
                className={errors.commercialCapacity ? 'error' : ''}
              />
              {errors.commercialCapacity && <div className="error-message">{errors.commercialCapacity}</div>}
            </div>
          </>
        )}

        {formData.solutionType === 'Only Module' && (
          <>
            <div className="form-group">
              <label htmlFor="moduleType">Module Type<span className="required">*</span></label>
              <select
                name="moduleType"
                id="moduleType"
                value={formData.moduleType}
                onChange={handleChange}
                className={errors.moduleType ? 'error' : ''}
              >
                <option value="">Select Module Type</option>
                <option value="DCR">DCR</option>
                <option value="NON DCR">NON DCR</option>
              </select>
              {errors.moduleType && <div className="error-message">{errors.moduleType}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="moduleQuantity">Quantity<span className="required">*</span></label>
              <input
                type="number"
                name="moduleQuantity"
                id="moduleQuantity"
                value={formData.moduleQuantity}
                onChange={handleChange}
                className={errors.moduleQuantity ? 'error' : ''}
              />
              {errors.moduleQuantity && <div className="error-message">{errors.moduleQuantity}</div>}
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us more about your inquiry..."
          ></textarea>
        </div>

        <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>

      {globalErrorMessage && (
        <div id="globalErrorMessage" style={{ display: 'block', color: '#e74c3c' }}>
          {globalErrorMessage}
        </div>
      )}
    </div>
  );
}

export default App;
