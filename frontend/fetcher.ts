const fetchWithError = async (url: string, init: RequestInit) => {
  const res = await fetch(url, {
    ...init,
    headers: {
      // this method defautly send json data so we can safely add this header.
      // some usecase(ex: multipart request) may need to remove this header,
      // in such case, user code can specify "Content-Type" in init.headers.
      "Content-Type": "application/json",
      ...init.headers,
      // this method only accept json response so we can safely add this header.
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const fetcher = {
  get: (url: string) => fetchWithError(url, { method: "GET" }),
  post: <Arg>(url: string, { arg }: { arg: Arg }) =>
    fetchWithError(url, { method: "POST", body: JSON.stringify(arg) }),
  put: <Arg>(url: string, { arg }: { arg: Arg }) =>
    fetchWithError(url, { method: "PUT", body: JSON.stringify(arg) }),
  patch: <Arg>(url: string, { arg }: { arg: Arg }) =>
    fetchWithError(url, { method: "PATCH", body: JSON.stringify(arg) }),
  delete: <Arg>(url: string, { arg }: { arg: Arg }) =>
    fetchWithError(url, { method: "DELETE", body: JSON.stringify(arg) }),
};
