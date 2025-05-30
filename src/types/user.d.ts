export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  role: 'recruiter' | 'jobseeker';
  access_token?: string;

  [key: string]: unknown;
}
