import { useReducer, useEffect, useCallback } from 'react';
import type { LibraryState, LibraryAction, Book, Member, Loan } from '../types';
import { addDays, getTodayDate } from '../utils/dateUtils';

const STORAGE_KEY = 'library-lite-data';

const initialState: LibraryState = {
  books: [],
  members: [],
  loans: [],
};

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

const libraryReducer = (state: LibraryState, action: LibraryAction): LibraryState => {
  switch (action.type) {
    case 'ADD_BOOK': {
      const newBook: Book = {
        ...action.payload,
        id: generateId(),
        status: 'available',
        checkoutCount: 0,
        waitlist: [],
      };
      return { ...state, books: [...state.books, newBook] };
    }

    case 'ADD_MEMBER': {
      const newMember: Member = {
        ...action.payload,
        id: generateId(),
      };
      return { ...state, members: [...state.members, newMember] };
    }

    case 'LEND_BOOK': {
      const { bookId, memberId } = action.payload;
      const book = state.books.find(b => b.id === bookId);
      if (!book) throw new Error('Book not found');
      if (book.status === 'on-loan') throw new Error('Book is already on loan');

      const loanDate = getTodayDate();
      const dueDate = addDays(loanDate, 7);

      const newLoan: Loan = {
        id: generateId(),
        bookId,
        memberId,
        loanDate,
        dueDate,
      };

      return {
        ...state,
        books: state.books.map(b =>
          b.id === bookId
            ? {
                ...b,
                status: 'on-loan',
                checkoutCount: b.checkoutCount + 1,
                currentLoan: newLoan,
              }
            : b
        ),
        loans: [...state.loans, newLoan],
      };
    }

    case 'RETURN_BOOK': {
      const { bookId } = action.payload;
      const book = state.books.find(b => b.id === bookId);
      if (!book || book.status !== 'on-loan')
        throw new Error('Book is not currently on loan');

      const updatedLoans = state.loans.filter(loan => loan.bookId !== bookId);

      if (book.waitlist.length > 0) {
        const nextMemberId = book.waitlist[0];
        const newWaitlist = book.waitlist.slice(1);
        const loanDate = getTodayDate();
        const dueDate = addDays(loanDate, 7);

        const newLoan: Loan = {
          id: generateId(),
          bookId,
          memberId: nextMemberId,
          loanDate,
          dueDate,
        };

        return {
          ...state,
          books: state.books.map(b =>
            b.id === bookId
              ? {
                  ...b,
                  checkoutCount: b.checkoutCount + 1,
                  currentLoan: newLoan,
                  waitlist: newWaitlist,
                }
              : b
          ),
          loans: [...updatedLoans, newLoan],
        };
      } else {
        return {
          ...state,
          books: state.books.map(b =>
            b.id === bookId
              ? { ...b, status: 'available', currentLoan: undefined }
              : b
          ),
          loans: updatedLoans,
        };
      }
    }

    case 'ADD_TO_WAITLIST': {
      const { bookId, memberId } = action.payload;
      const book = state.books.find(b => b.id === bookId);
      if (!book) throw new Error('Book not found');
      if (book.waitlist.includes(memberId))
        throw new Error('Member is already on the waitlist');

      return {
        ...state,
        books: state.books.map(b =>
          b.id === bookId
            ? { ...b, waitlist: [...b.waitlist, memberId] }
            : b
        ),
      };
    }

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
};

const init = (): LibraryState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      const loans = parsed.loans.map((loan: Loan) => ({
        ...loan,
        loanDate: new Date(loan.loanDate),
        dueDate: new Date(loan.dueDate),
      }));

      const books = parsed.books.map((b: Book) => {
        if (b.currentLoan) {
          return {
            ...b,
            currentLoan: {
              ...b.currentLoan,
              loanDate: new Date(b.currentLoan.loanDate),
              dueDate: new Date(b.currentLoan.dueDate),
            },
          };
        }
        return b;
      });

      return { ...parsed, loans, books };
    }
  } catch (e) {
    console.error('Failed to load library data:', e);
  }
  return initialState;
};

export const useLibraryStore = () => {
  const [state, dispatch] = useReducer(libraryReducer, initialState, init);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save library data:', error);
    }
  }, [state]);

  const addBook = useCallback(
    (book: Omit<Book, 'id' | 'status' | 'checkoutCount' | 'waitlist'>) => {
      const duplicate = state.books.some(
        b => b.title.toLowerCase() === book.title.toLowerCase()
      );
      if (duplicate) {
        return { success: false, message: 'A book with this title already exists' };
      }
      dispatch({ type: 'ADD_BOOK', payload: book });
      return { success: true, message: 'Book added successfully!' };
    },
    [state.books]
  );

  const addMember = useCallback((member: Omit<Member, 'id'>) => {
    try {
      dispatch({ type: 'ADD_MEMBER', payload: member });
      return { success: true, message: 'Member added successfully!' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add member',
      };
    }
  }, []);

  const lendBook = useCallback((bookId: string, memberId: string) => {
    try {
      dispatch({ type: 'LEND_BOOK', payload: { bookId, memberId } });
      return { success: true, message: 'Book lent successfully!' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to lend book',
      };
    }
  }, []);

  const returnBook = useCallback(
    (bookId: string) => {
      try {
        const book = state.books.find(b => b.id === bookId);
        const hasWaitlist = book && book.waitlist.length > 0;

        dispatch({ type: 'RETURN_BOOK', payload: { bookId } });

        if (hasWaitlist) {
          const nextMember = state.members.find(
            m => m.id === book.waitlist[0]
          );
          const memberName = nextMember
            ? `${nextMember.firstName} ${nextMember.lastName}`
            : 'Next member';
          return {
            success: true,
            message: `Book returned and automatically lent to ${memberName}!`,
          };
        } else {
          return { success: true, message: 'Book returned successfully!' };
        }
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to return book',
        };
      }
    },
    [state.books, state.members]
  );

  const addToWaitlist = useCallback((bookId: string, memberId: string) => {
    try {
      dispatch({ type: 'ADD_TO_WAITLIST', payload: { bookId, memberId } });
      return { success: true, message: 'Added to waitlist successfully!' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add to waitlist',
      };
    }
  }, []);

  const getMemberLoans = useCallback(
    (memberId: string) => state.loans.filter(loan => loan.memberId === memberId),
    [state.loans]
  );

  const getMemberName = useCallback(
    (memberId: string) => {
      const member = state.members.find(m => m.id === memberId);
      return member ? `${member.firstName} ${member.lastName}` : 'Unknown';
    },
    [state.members]
  );

  const getBookTitle = useCallback(
    (bookId: string) => {
      const book = state.books.find(b => b.id === bookId);
      return book ? book.title : 'Unknown';
    },
    [state.books]
  );

  return {
    state,
    actions: { addBook, addMember, lendBook, returnBook, addToWaitlist },
    helpers: { getMemberLoans, getMemberName, getBookTitle },
  };
};
