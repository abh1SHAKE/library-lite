import { BookForm } from '../components/BookForm';
import { BookList } from '../components/BookList';
import { useLibraryStore } from '../hooks/useLibraryStore';

interface CatalogPageProps {
  onNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onNotification }) => {
  const { state, actions, helpers } = useLibraryStore();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <BookForm
            onSubmit={actions.addBook}
            onNotification={onNotification}
          />
        </div>

        <div className="lg:col-span-2">
          <BookList
            books={state.books}
            members={state.members}
            onLendBook={actions.lendBook}
            onReturnBook={actions.returnBook}
            onAddToWaitlist={actions.addToWaitlist}
            onNotification={onNotification}
            getMemberName={helpers.getMemberName}
          />
        </div>
      </div>
    </div>
  );
};