import React from "react";

export interface ProfileInfo {
  name: string,
  email: string,
  image: string,
}
export type ProfileSetter = (_: ProfileInfo | null) => void;

export const ProfileContext = React.createContext<{
  get: ProfileInfo | null, set: ProfileSetter
}>({ get: null, set: (_) => { } });

export async function populateProfile(setProfile: ProfileSetter) {
  let token = localStorage.getItem("token");
  if (token == null) { return }

  let response = await fetch("/api/accounts/myself", {
    headers: new Headers({
      "Authorization": "Bearer " + token,
    })
  });

  switch (response.status) {
    case 200:
      let profile = await response.json();
      setProfile({
        name: profile["username"] as string,
        email: profile["email"] as string,
        image: "/images/logo.svg"
      })
      break;
    case 401:
      // jwt is not valid -> logout
      localStorage.removeItem("token");
      break;
    default:
      console.error("unexpected error getting myself: " + response.statusText)
  }
}
