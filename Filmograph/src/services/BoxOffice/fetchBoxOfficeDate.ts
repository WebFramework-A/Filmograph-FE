import type { ChartDataPoint, DailyData } from "../../types/boxOfficeTrend";
import { getPastDate } from "../../utils/getPastDate";
import axiosKobisInstance from "../axios";

export interface BoxOfficeDataResult {
  chartData: ChartDataPoint[];
  allMovies: string[];
  lastUpdated: string;
}

export const fetchBoxOfficeData = async (): Promise<BoxOfficeDataResult> => {
  // 지난 7일간의 데이터 요청 (어제~7일전)
  const requests = [];
  const dateMap: {
    displayFmt: string;
    apiFmt: any;
  }[] = [];

  for (let i = 7; i >= 1; i--) {
    const dateObj = getPastDate(i);
    dateMap.push(dateObj);
    requests.push(
      axiosKobisInstance.get<DailyData>("/searchDailyBoxOfficeList.json", {
        params: {
          key: import.meta.env.VITE_KOBIS_API_KEY,
          targetDt: dateObj.apiFmt,
        },
      })
    );
  }

  const responses = await Promise.all(requests);
  const jsonResults = responses.map((res) => res.data);

  // 데이터 가공
  const chartData: ChartDataPoint[] = [];
  const movieSet = new Set<string>();

  jsonResults.forEach((json: DailyData, index) => {
    if (!json.boxOfficeResult) return;

    const dailyList = json.boxOfficeResult.dailyBoxOfficeList;
    const dataPoint: ChartDataPoint = {
      date: dateMap[index].displayFmt,
      fullDate: dateMap[index].apiFmt,
    };

    dailyList.forEach((movie) => {
      const rank = parseInt(movie.rank, 10);
      // 1위부터 10위까지만 추적
      if (rank <= 10) {
        dataPoint[movie.movieNm] = rank;
        movieSet.add(movie.movieNm);
      }
    });

    chartData.push(dataPoint);
  });

  return {
    chartData,
    allMovies: Array.from(movieSet),
    lastUpdated: new Date().toLocaleTimeString(),
  };
};
