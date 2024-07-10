import { UUIDVersion } from 'express-validator/lib/options';

interface Client {
  id: UUIDVersion;
  name?: string | undefined;
  phone_number?: string | undefined;
  user_id: UUIDVersion;
  state: boolean;
}

interface Role {
  id: number;
  name: string;
}

export interface UserProps {
  id: UUIDVersion;
  email: string;
  state: boolean;
  role_id: number;
  createdAt: Date;
  updatedAt: Date;
  Role: Role;
  Client?: Client;
  isNew?: boolean;
}
