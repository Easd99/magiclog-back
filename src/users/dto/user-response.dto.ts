export class UserResponseDto {
  id: number;
  email: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
