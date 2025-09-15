import { MemberForm } from '../components/MemberForm';
import { MemberList } from '../components/MemberList';
import { useLibraryStore } from '../hooks/useLibraryStore';

interface MembersPageProps {
  onNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({ onNotification }) => {
  const { state, actions, helpers } = useLibraryStore();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <MemberForm
            onSubmit={actions.addMember}
            onNotification={onNotification}
          />
        </div>

        <div className="lg:col-span-2">
          <MemberList
            members={state.members}
            getMemberLoans={helpers.getMemberLoans}
            getBookTitle={helpers.getBookTitle}
          />
        </div>
      </div>
    </div>
  );
};