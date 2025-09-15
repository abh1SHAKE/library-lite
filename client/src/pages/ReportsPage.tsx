import { ReportList } from '../components/ReportList';
import { useLibraryStore } from '../hooks/useLibraryStore';

export const ReportsPage: React.FC = () => {
  const { state, helpers } = useLibraryStore();

  return (
    <div>
      <ReportList
        books={state.books}
        loans={state.loans}
        getMemberName={helpers.getMemberName}
      />
    </div>
  );
};