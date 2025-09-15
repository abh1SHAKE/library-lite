import { useState } from 'react';
import type { Book, Loan } from '../types';
import { formatDate, isOverdue, getDaysOverdue } from '../utils/dateUtils';

interface ReportListProps {
  books: Book[];
  loans: Loan[];
  getMemberName: (memberId: string) => string;
}

export const ReportList: React.FC<ReportListProps> = ({
  books,
  loans,
  getMemberName,
}) => {
  const [activeReport, setActiveReport] = useState<'overdue' | 'top-books'>(
    'overdue'
  );
  const [topBooksCount, setTopBooksCount] = useState(10);

  const overdueLoans = loans
    .filter((loan) => isOverdue(loan.dueDate))
    .map((loan) => {
      const book = books.find((b) => b.id === loan.bookId);
      const daysOverdue = getDaysOverdue(loan.dueDate);
      return {
        ...loan,
        book,
        memberName: getMemberName(loan.memberId),
        daysOverdue,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  const topBooks = books
    .filter((book) => book.checkoutCount > 0)
    .sort((a, b) => {
      if (a.checkoutCount === b.checkoutCount) {
        return a.title.localeCompare(b.title);
      }
      return b.checkoutCount - a.checkoutCount;
    })
    .slice(0, topBooksCount);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl text-[#16a34a] font-semibold mb-4">
          Library Reports
        </h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveReport('overdue')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeReport === 'overdue'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Overdue Books
          </button>
          <button
            onClick={() => setActiveReport('top-books')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeReport === 'top-books'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Popular Books
          </button>
        </div>

        {activeReport === 'top-books' && (
          <div className="mb-4">
            <label
              htmlFor="topCount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of books to show
            </label>
            <div className="relative max-w-[282px]">
              <select
                id="topCount"
                value={topBooksCount}
                onChange={(e) => setTopBooksCount(Number(e.target.value))}
                className="
                  w-full px-3 py-2 pr-10
                  border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  appearance-none bg-white
                "
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {activeReport === 'overdue' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg text-[#373737] font-medium">
                Overdue Books Report
              </h3>
              {overdueLoans.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {overdueLoans.length} overdue
                </span>
              )}
            </div>

            {overdueLoans.length === 0 ? (
              <div className="text-center py-8 px-4 text-green-600 bg-green-50 rounded-lg">
                🎉 No overdue books! All loans are current.
              </div>
            ) : (
              <div className="space-y-3">
                {overdueLoans.map((loan, index) => (
                  <div
                    key={loan.id}
                    className="border border-red-200 rounded-lg p-4 bg-red-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            #{index + 1}
                          </span>
                          <h4 className="text-lg font-medium text-gray-900">
                            {loan.book?.title || 'Unknown Book'}
                          </h4>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            {loan.daysOverdue} days overdue
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Author: {loan.book?.author || 'Unknown'}</p>
                          <p>Borrowed by: {loan.memberName}</p>
                          <p>Borrowed on: {formatDate(loan.loanDate)}</p>
                          <p className="text-red-600 font-medium">
                            Due date: {formatDate(loan.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeReport === 'top-books' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-medium">
                Top {topBooksCount} Most Popular Books
              </h3>
            </div>

            {topBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No books have been checked out yet.
              </div>
            ) : (
              <div className="space-y-3">
                {topBooks.map((book, index) => {
                  const rank = index + 1;
                  const getRankColor = (rank: number) => {
                    if (rank === 1)
                      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    if (rank === 2)
                      return 'bg-gray-100 text-gray-800 border-gray-200';
                    if (rank === 3)
                      return 'bg-orange-100 text-orange-800 border-orange-200';
                    return 'bg-blue-50 text-blue-800 border-blue-200';
                  };

                  return (
                    <div
                      key={book.id}
                      className={`border rounded-lg p-4 ${getRankColor(rank)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-700">
                              #{rank}
                            </span>
                            <h4 className="text-lg font-medium text-gray-900">
                              {book.title}
                            </h4>
                            {rank <= 3 && (
                              <span className="text-lg">
                                {rank === 1
                                  ? '🥇'
                                  : rank === 2
                                  ? '🥈'
                                  : '🥉'}
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Author: {book.author}</p>
                            <p className="font-medium">
                              Total checkouts: {book.checkoutCount}
                            </p>
                            <p>
                              Current status:
                              <span
                                className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  book.status === 'available'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {book.status === 'available'
                                  ? 'Available'
                                  : 'On Loan'}
                              </span>
                            </p>
                            {book.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {book.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white bg-opacity-50"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-[#373737] mb-2">
          Report Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p title="Total Books" className="text-[#373737] cursor-default truncate">Total Books</p>
            <p className="text-lg font-semibold text-gray-900">{books.length}</p>
          </div>
          <div>
            <p title="Books Checked Out" className="text-[#373737] cursor-default truncate">Books Checked Out</p>
            <p className="text-lg font-semibold text-gray-900">
              {books.filter((book) => book.checkoutCount > 0).length}
            </p>
          </div>
          <div>
            <p title="Currently On Loan" className="text-[#373737] cursor-default truncate">Currently On Loan</p>
            <p className="text-lg font-semibold text-gray-900">
              {books.filter((book) => book.status === 'on-loan').length}
            </p>
          </div>
          <div>
            <p className="text-[#373737] cursor-default truncate">Overdue Books</p>
            <p className="text-lg font-semibold text-red-600">
              {overdueLoans.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
