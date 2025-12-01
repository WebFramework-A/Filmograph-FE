import { useQuery } from "@tanstack/react-query";
import { fetchBoxOfficeData, type BoxOfficeDataResult } from "../BoxOffice/fetchBoxOfficeDate";

export const useFetchBoxOfficeDate = () => {
  return useQuery<BoxOfficeDataResult>({
    queryKey: ["boxOfficeDate"],
    queryFn: fetchBoxOfficeData,

    staleTime: 5 * 60 * 1_000, // 5분
    gcTime: 10 * 60 * 1_000, // 10분
    refetchInterval: 10 * 60 * 1_000, // 10분
  });
};
