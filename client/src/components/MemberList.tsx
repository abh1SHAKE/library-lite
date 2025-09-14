import { useState } from 'react';
import type { Member, Loan } from '../types';
import { formatDate, isOverdue, getDaysOverdue } from '../utils/dateUtils';

interface MemberListProps {
  members: Member[];
  getMemberLoans: (memberId: string) => Loan[];
  getBookTitle: (bookId: string) => string;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  getMemberLoans,
  getBookTitle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 5;
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(members.length / membersPerPage);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl text-[#16a34a] font-semibold mb-6">Library Members</h2>

      {members.length > 0 && (
        <div className="my-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Members</p>
              <p className="text-lg font-semibold text-gray-900">{members.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Active Loans</p>
              <p className="text-lg font-semibold text-gray-900">
                {members.reduce((total, member) => total + getMemberLoans(member.id).length, 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Members with Loans</p>
              <p className="text-lg font-semibold text-gray-900">
                {members.filter(member => getMemberLoans(member.id).length > 0).length}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Members with Overdue</p>
              <p className="text-lg font-semibold text-red-600">
                {members.filter(member =>
                  getMemberLoans(member.id).some(loan => isOverdue(loan.dueDate))
                ).length}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {members.length === 0 ? (
          <div className="text-center py-8 text-[#373737]">
            No members registered yet.
          </div>
        ) : (
          currentMembers.map(member => {
            const loans = getMemberLoans(member.id);
            const activeLoans = loans;
            const overdueLoans = activeLoans.filter(loan => isOverdue(loan.dueDate));

            return (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </h3>
                      {overdueLoans.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {overdueLoans.length} Overdue
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-500 mb-3">
                      <p>Active loans: {activeLoans.length}</p>
                      <p>Member ID: {member.id}</p>
                    </div>

                    {activeLoans.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Current Books:</h4>
                        {activeLoans.map(loan => {
                          const overdue = isOverdue(loan.dueDate);
                          const daysOverdue = overdue ? getDaysOverdue(loan.dueDate) : 0;

                          return (
                            <div
                              key={loan.id}
                              className={`p-3 rounded-md border-l-4 ${
                                overdue ? 'bg-red-50 border-red-400' : 'bg-gray-50 border-gray-300'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {getBookTitle(loan.bookId)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Borrowed: {formatDate(loan.loanDate)}
                                  </p>
                                  <p
                                    className={`text-sm ${
                                      overdue ? 'text-red-600 font-medium' : 'text-gray-600'
                                    }`}
                                  >
                                    Due: {formatDate(loan.dueDate)}
                                    {overdue && ` (${daysOverdue} days overdue)`}
                                  </p>
                                </div>
                                {overdue && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                    Overdue
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-[#373737] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-[#373737] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
