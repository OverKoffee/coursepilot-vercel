import { Amplify } from "aws-amplify";

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID;
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
const redirectSignIn = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN;
const redirectSignOut = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT;

if (
  !userPoolId ||
  !userPoolClientId ||
  !cognitoDomain ||
  !redirectSignIn ||
  !redirectSignOut
) {
  throw new Error("Missing required Cognito environment variables.");
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        oauth: {
          domain: cognitoDomain.replace(/^https?:\/\//, ""),
          scopes: ["openid", "email", "profile"],
          redirectSignIn: [redirectSignIn],
          redirectSignOut: [redirectSignOut],
          responseType: "code",
        },
      },
    },
  },
});