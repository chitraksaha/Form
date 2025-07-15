import React, { useEffect, useState } from 'react';
import './App.css'; // Ensure your CSS file is correctly linked

// SuccessPage Component - This will be displayed after successful form submission
function SuccessPage({ onGoBack }) {
  return (
    <div className="form-container success-page-container"> {/* Reusing form-container styles */}
      <h2 className="form-title">Thank You!</h2>
      <div className="form-success" style={{ display: 'block', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2em', marginBottom: '15px' }}>
          Your form has been submitted successfully.
        </p>
        <p>We appreciate you taking the time to fill it out.</p>
      </div>
      <button
        onClick={onGoBack}
        className="submit-btn" // Reusing submit button styles
        style={{ marginTop: '30px', backgroundColor: '#28a745' }} // Green button for going back
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
  // Clear global error message when the component mounts)
  const place_holder_lables = {
    'salutation' : 'eg: Mr.',
    'firstName' : 'eg: Vikram',
    'lastName' : 'eg: Roy',
    'email' : 'eg: roy@gmail.com',
    'mobile' : 'eg: 9998887770',
    'country' : 'eg: India',
    'zipcode' : 'eg: 700215',
    'hearAbout' : 'eg: Search Engine'
  }
  // NEW STATE: Controls which "page" is shown (form or success page)
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  // const [errorMsg, setErrorMsg] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setGlobalErrorMessage(''); // Clear global error on any input change
  };
  
  const validate = async () => {
    const newErrors = {};
    
    // Required fields and their specific messages
    if (!formData.salutation) newErrors.salutation = 'Please select a salutation';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.zipcode.trim()) newErrors.zipcode = 'Zipcode is required';
    if (!formData.hearAbout) newErrors.hearAbout = 'Please select where you heard about us';
    if (!formData.solutionType) newErrors.solutionType = 'Please select a solution type';

    // Regex/Format Validations - these will show "Invalid Entry"
    if (formData.firstName.trim() && !/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) newErrors.firstName = 'Invalid Entry. Enter only characters.';
    if (formData.lastName.trim() && !/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) newErrors.lastName = 'Invalid Entry. Enter only characters';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = 'Invalid Entry. Enter a valid email ID.';
    if (formData.mobile.trim() && !/^\d{10,15}$/.test(formData.mobile.trim())) newErrors.mobile = 'Invalid Entry. Enter valid 10-digit mobile number.';
    if (formData.country.trim() && !/^[a-zA-Z\s-]+$/.test(formData.country.trim())) newErrors.country = 'Invalid Entry. Enter only characters';
    if (formData.zipcode.trim() && !/^\d{6}$/.test(formData.zipcode.trim())) newErrors.zipcode = 'Invalid Entry. Enter a valid 6-digit pincode.';
    //if (formData.zipcode.trim() && !/^\d{6}$/.test(formData.zipcode.trim())) {newErrors.zipcode = 'Invalid Entry. Enter a valid 6-digit pincode.';}
    
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
    setGlobalErrorMessage(''); // Clear global error on new submission attempt
    setErrors({}); // Clear previous errors
    
    const newErrors = await validate();
    // setErrorMsg(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      // Set errors in state
      console.log('Validation errors in state:', errors);
      
      // Clear incorrect entry fields
      const clearedData = { ...formData };
      for (const fieldName in newErrors) {
        if (initialValues.hasOwnProperty(fieldName)) {
          // Only clear text/number inputs. Selects will naturally reset to their default option.
          const fieldElement = document.getElementById(fieldName);
          if (fieldElement && (fieldElement.tagName === 'INPUT' || fieldElement.tagName === 'TEXTAREA')) {
            clearedData[fieldName] = initialValues[fieldName];
          }
        }
      }
      // setFormData(clearedData);
      
      setErrors(newErrors);
      setGlobalErrorMessage('Invalid Entry'); // Show global error message
      return; // Stop submission
    }

    setLoading(true);

    try {
      // Your actual API call
      const response = await fetch('https://xl9cdzpsid.execute-api.us-west-2.amazonaws.com/dev/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      console.log('Lambda response:', result);

      // ON SUCCESS:
      setFormData(initialValues); // Reset form data
      setErrors({}); // Clear all errors
      setGlobalErrorMessage(''); // Ensure global error is cleared
      setShowSuccessPage(true); // NEW: Show the success page

    } catch (error) {
      console.error('Submission error:', error);
      setGlobalErrorMessage('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to go back to the form from the success page
  const handleGoBackToForm = () => {
    setShowSuccessPage(false);
    // Form data is already reset by handleSubmit on success
  };

  return (
    // Conditional rendering: show SuccessPage if showSuccessPage is true, otherwise show the form
    showSuccessPage ? (
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
                {label}{['salutation', 'firstName', 'lastName', 'email', 'mobile', 'country', 'zipcode', 'hearAbout'].includes(name) && <span className="required">*</span>}
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
                  <>
                  {errors[name] && (
                    <div style={{
                      "color": "#e74c3c",
                      "fontSize": "12px",
                      "marginTop": "5px",
                      "display": "block", 
                    }}>{errors[name]}</div>
                  )}
                  </>
                </>
                
              )}
              {/* {errors[name] && <div className="error-message">{errors[name]}</div>} */}
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
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} placeholder="Tell us more about your inquiry..."></textarea>
          </div>

          <button type="submit" className={`submit-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Form'}
          </button>
        </form>

        {/* Global Error Message Display (only when form is shown and there's a global error) */}
        {globalErrorMessage && (
          <div id="globalErrorMessage" style={{ display: 'block' , color: '#e74c3c'}}>
            {globalErrorMessage}
          </div>
        )}
      </div>
    )
  );
}

export default App;
