import axios from "axios";
import _ from "lodash";
import toast from "react-hot-toast";
import useSWR from "swr";

export const scheme = process.env.REACT_APP_SCHEME;
export const domain = process.env.REACT_APP_DOMAIN;
export const baseUrl = `${scheme}://${domain}`;

export const http = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const fetcher = (url) => {
  return sleep(300).then(() => {
    return http.get().then((r) => r.data);
  });
};

export const notifySuccess = (msg) => toast.success(msg);
export const notifyError = (msg) => toast.error(msg);

export const useMediaList = ({ purge }) => {
  const target = purge ? `${baseUrl}?CACHE_PURGE=1` : baseUrl;
  const { data, error } = useSWR(target, fetcher);
  return {
    data: data,
    isLoading: !data && !error,
    isError: error,
  };
};