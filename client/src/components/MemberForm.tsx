import { useState } from 'react';

interface MemberFormProps {
  onSubmit: (member: { firstName: string; lastName: string }) => { success: boolean; message: string };
  onNotification: (message: string, type: 'success' | 'error') => void;
}

export const MemberForm: React.FC<MemberFormProps> = ({ onSubmit, onNotification }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      onNotification('First name and last name are required', 'error');
      return;
    }

    setIsSubmitting(true);
    
    const result = onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    if (result.success) {
      setFirstName('');
      setLastName('');
      onNotification(result.message, 'success');
    } else {
      onNotification(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl text-[#16a34a] font-semibold mb-4">Add New Member</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-[#373737] mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter first name"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-[#373737] mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter last name"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
};