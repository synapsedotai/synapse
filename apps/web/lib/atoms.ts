import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// REGULAR USER AUTH - completely separate
export const userAuthenticatedAtom = atomWithStorage('synapse_user_authenticated', false);
export const userDataAtom = atomWithStorage<User | null>('synapse_user_data', null);

export const isUserLoggedInAtom = atom(
  (get) => get(userAuthenticatedAtom) && get(userDataAtom) !== null
);

// NEXUS EXECUTIVE AUTH - completely separate  
export const nexusAuthenticatedAtom = atomWithStorage('synapse_nexus_authenticated', false);
export const nexusDataAtom = atomWithStorage<User | null>('synapse_nexus_data', null);

export const isNexusLoggedInAtom = atom(
  (get) => get(nexusAuthenticatedAtom) && get(nexusDataAtom) !== null
);

// USER AUTH ACTIONS
export const userLoginAtom = atom(
  null,
  (get, set, user: User) => {
    set(userDataAtom, user);
    set(userAuthenticatedAtom, true);
  }
);

export const userLogoutAtom = atom(
  null,
  (get, set) => {
    set(userDataAtom, null);
    set(userAuthenticatedAtom, false);
  }
);

// NEXUS AUTH ACTIONS
export const nexusLoginAtom = atom(
  null,
  (get, set, user: User) => {
    set(nexusDataAtom, user);
    set(nexusAuthenticatedAtom, true);
  }
);

export const nexusLogoutAtom = atom(
  null,
  (get, set) => {
    set(nexusDataAtom, null);
    set(nexusAuthenticatedAtom, false);
  }
);

// Mock Google OAuth response
export interface GoogleOAuthResponse {
  id: string;
  name: string;
  email: string;
  picture: string;
}

// Mock Google OAuth function
export const mockGoogleLogin = (): Promise<GoogleOAuthResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '123456789',
        name: 'Joe Raft',
        email: 'joe.raft@example.com',
        picture: 'https://via.placeholder.com/40x40'
      });
    }, 1000); // Simulate network delay
  });
};

export const mockAdminLogin = (): Promise<GoogleOAuthResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'admin123',
        name: 'Sarah Chen',
        email: 'sarah.chen@synapse.com',
        picture: 'https://via.placeholder.com/40x40'
      });
    }, 1000);
  });
};
