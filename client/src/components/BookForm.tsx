import { useState } from 'react';

interface BookFormProps {
  onSubmit: (book: { title: string; author: string; tags: string[] }) => { success: boolean; message: string };
  onNotification: (message: string, type: 'success' | 'error') => void;
}

export const BookForm: React.FC<BookFormProps> = ({ onSubmit, onNotification }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !author.trim()) {
      onNotification('Title and author are required', 'error');
      return;
    }

    setIsSubmitting(true);
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const result = onSubmit({
      title: title.trim(),
      author: author.trim(),
      tags,
    });

    if (result.success) {
      setTitle('');
      setAuthor('');
      setTagsInput('');
      onNotification(result.message, 'success');
    } else {
      onNotification(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl text-[#16a34a] font-semibold mb-4">Add New Book</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#373737] mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter book title"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-[#373737] mb-1">
            Author *
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter author name"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-[#373737] mb-1">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(e.g., fiction, mystery, bestseller)"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Book'}
        </button>
      </form>
    </div>
  );
};