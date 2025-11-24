export const cleanObject = (input: any): any => {
  if (input === null || input === undefined) return undefined;

  if (Array.isArray(input)) {
    const cleanedArray = input
      .map((item) => cleanObject(item))
      .filter((item) => item !== undefined);

    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  if (typeof input === "object") {
    const cleanedObj: any = {};

    Object.entries(input).forEach(([key, value]) => {
      const cleanedValue = cleanObject(value);

      if (cleanedValue !== undefined) {
        cleanedObj[key] = cleanedValue;
      }
    });

    return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined;
  }

  return input;
};