export interface Book {
  id: string;
  title: string;
  author: string;
  tags: string[];
  status: 'available' | 'on-loan';
  checkoutCount: number;
  currentLoan?: Loan;
  waitlist: string[];
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Loan {
  id: string;
  bookId: string;
  memberId: string;
  loanDate: Date;
  dueDate: Date;
}

export interface LibraryState {
  books: Book[];
  members: Member[];
  loans: Loan[];
}

export type LibraryAction =
  | { type: 'ADD_BOOK'; payload: Omit<Book, 'id' | 'status' | 'checkoutCount' | 'waitlist'> }
  | { type: 'ADD_MEMBER'; payload: Omit<Member, 'id'> }
  | { type: 'LEND_BOOK'; payload: { bookId: string; memberId: string } }
  | { type: 'RETURN_BOOK'; payload: { bookId: string } }
  | { type: 'ADD_TO_WAITLIST'; payload: { bookId: string; memberId: string } }
  | { type: 'LOAD_STATE'; payload: LibraryState };

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
}