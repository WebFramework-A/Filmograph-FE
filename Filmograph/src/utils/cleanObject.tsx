// undefined / null / 빈 배열 / 빈 객체 제거
export const cleanObject = (obj: any) => {
  const cleaned: any = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      cleaned[key] = value;
    }
  });

  return cleaned;
};
