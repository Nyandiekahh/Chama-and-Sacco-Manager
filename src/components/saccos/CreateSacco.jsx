import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSacco } from '../../contexts/SaccoContext';
import Card from '../common/Card';
import Alert from '../common/Alert';

const CreateSacco = () => {
  const { createSacco } = useSacco();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    share_capital_amount: '',
    monthly_contribution_amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Convert string amounts to numbers
      const saccoData = {
        ...formData,
        share_capital_amount: parseFloat(formData.share_capital_amount),
        monthly_contribution_amount: parseFloat(formData.monthly_contribution_amount)
      };
      
      const newSacco = await createSacco(saccoData);
      navigate(`/saccos/${newSacco.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create Sacco');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Sacco</h2>
      </div>
      
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Sacco Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter Sacco name"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe the purpose of this Sacco"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label htmlFor="share_capital_amount" className="block text-sm font-medium text-gray-700">
                Share Capital Amount *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="share_capital_amount"
                  id="share_capital_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.share_capital_amount}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This is the total amount each member needs to contribute as share capital.
              </p>
            </div>
            
            <div>
              <label htmlFor="monthly_contribution_amount" className="block text-sm font-medium text-gray-700">
                Monthly Contribution Amount *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="monthly_contribution_amount"
                  id="monthly_contribution_amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.monthly_contribution_amount}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                The recurring monthly contribution required from each member.
              </p>
            </div>
          </div>
          
          <div className="pt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/saccos')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Sacco'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateSacco;