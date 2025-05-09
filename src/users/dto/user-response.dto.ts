export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
