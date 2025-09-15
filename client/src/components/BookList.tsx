import { useState } from "react";
import type { Book, Member } from "../types";
import { formatDate } from "../utils/dateUtils";

interface BookListProps {
  books: Book[];
  members: Member[];
  onLendBook: (
    bookId: string,
    memberId: string
  ) => { success: boolean; message: string };
  onReturnBook: (bookId: string) => { success: boolean; message: string };
  onAddToWaitlist: (
    bookId: string,
    memberId: string
  ) => { success: boolean; message: string };
  onNotification: (message: string, type: "success" | "error" | "info") => void;
  getMemberName: (memberId: string) => string;
}

export const BookList: React.FC<BookListProps> = ({
  books,
  members,
  onLendBook,
  onReturnBook,
  onAddToWaitlist,
  onNotification,
  getMemberName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [actioningBookId, setActioningBookId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const handleLendBook = async (bookId: string) => {
    if (!selectedMemberId) {
      onNotification("Please select a member to lend the book to", "error");
      return;
    }

    setActioningBookId(bookId);
    const book = books.find((b) => b.id === bookId);

    if (!book) {
      onNotification("Book not found", "error");
      setActioningBookId(null);
      return;
    }

    if (book.currentLoan?.memberId === selectedMemberId) {
      onNotification("This member is already borrowing this book", "error");
      setActioningBookId(null);
      return;
    }

    if (book.waitlist.includes(selectedMemberId)) {
      onNotification("This member is already in the waitlist", "error");
      setActioningBookId(null);
      return;
    }

    if (book.status === "available") {
      const result = onLendBook(bookId, selectedMemberId);
      onNotification(result.message, result.success ? "success" : "error");
    } else {
      const result = onAddToWaitlist(bookId, selectedMemberId);
      onNotification(result.message, result.success ? "success" : "error");
    }

    setActioningBookId(null);
    setSelectedMemberId("");
  };

  const handleReturnBook = async (bookId: string) => {
    setActioningBookId(bookId);
    const result = onReturnBook(bookId);
    onNotification(result.message, result.success ? "success" : "info");
    setActioningBookId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl text-[#16a34a] font-semibold mb-4">
          Book Catalog
        </h2>

        <div className="mb-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-[#373737] mb-1"
          >
            Search Books
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search by title..."
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="member"
            className="block text-sm font-medium text-[#373737] mb-1"
          >
            Select Member for Lending
          </label>

          <div className="relative">
            <select
              id="member"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="
                w-full px-3 py-2 pr-10
                border border-gray-300 rounded-md
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                appearance-none
              "
            >
              <option value="">Choose a member...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
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
      </div>

      <div className="space-y-4">
        {currentBooks.length === 0 && filteredBooks.length > 0 ? (
          <div className="text-center py-8 text-[#373737]">
            No books found on this page.
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-8 text-[#373737]">
            {searchTerm
              ? "No books found matching your search."
              : "No books in the catalog yet."}
          </div>
        ) : (
          currentBooks.map((book) => {
            const isBorrower = book.currentLoan?.memberId === selectedMemberId;
            const isInWaitlist = book.waitlist.includes(selectedMemberId);
            const disableWaitlist = !selectedMemberId || actioningBookId === book.id || isBorrower || isInWaitlist;

            return (
              <div key={book.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {book.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          book.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {book.status === "available" ? "Available" : "On Loan"}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-2">by {book.author}</p>

                    {book.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {book.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Checkout count: {book.checkoutCount}</p>

                      {book.status === "on-loan" && book.currentLoan && (
                        <>
                          <p>
                            Borrowed by:{" "}
                            {getMemberName(book.currentLoan.memberId)}
                          </p>
                          <p>Due: {formatDate(book.currentLoan.dueDate)}</p>
                        </>
                      )}

                      {book.waitlist.length > 0 && (
                        <p>
                          Waitlist ({book.waitlist.length}):{" "}
                          {book.waitlist
                            .map((memberId) => getMemberName(memberId))
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {book.status === "available" ? (
                      <button
                        onClick={() => handleLendBook(book.id)}
                        disabled={!selectedMemberId || actioningBookId === book.id}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actioningBookId === book.id ? "Lending..." : "Lend Book"}
                      </button>
                    ) : (
                      <div className="flex flex-row gap-4">
                        <button
                          onClick={() => handleReturnBook(book.id)}
                          disabled={actioningBookId === book.id}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actioningBookId === book.id ? "Returning..." : "Return Book"}
                        </button>

                        <button
                          onClick={() => handleLendBook(book.id)}
                          disabled={disableWaitlist}
                          className={`px-4 py-2 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            disableWaitlist
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                          }`}
                        >
                          {isBorrower
                            ? "Already Borrowing"
                            : isInWaitlist
                            ? "Already in Waitlist"
                            : actioningBookId === book.id
                            ? "Adding..."
                            : "Join Waitlist"}
                        </button>
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
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-[#373737] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
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

