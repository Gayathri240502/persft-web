import { getTokenAndRole } from "@/app/containers/utils/session/CheckSession";

export const fetchWithAuthGet = async (url: string) => {
  const { token } = getTokenAndRole();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchWithAuthPost = async (url: string, body: any) => {
  const { token } = getTokenAndRole();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchWithAuthPut = async (url: string, body: any) => {
  const { token } = getTokenAndRole();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchWithAuthDelete = async (url: string) => {
  const { token } = getTokenAndRole();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};
