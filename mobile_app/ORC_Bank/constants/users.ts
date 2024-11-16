export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    balance: number;
    accountNumber: string;
  }
  
  export const USERS: User[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phoneNumber: "0123456789",
      balance: 50000000,
      accountNumber: "1234567890",
    },
    {
      id: "2",
      name: "Trần Thị B",
      email: "tranthib@example.com",
      phoneNumber: "0987654321",
      balance: 20000000,
      accountNumber: "0987654321",
    },
  ];
  