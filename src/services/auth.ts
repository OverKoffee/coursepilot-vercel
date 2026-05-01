import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";

export async function loginWithCognito() {
  await signInWithRedirect();
}

export async function logoutUser() {
  await signOut();
}

export async function getLoggedInUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}