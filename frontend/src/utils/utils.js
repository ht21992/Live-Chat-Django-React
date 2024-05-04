export function getFirstErrorMessage(data) {
  for (const key in data) {
      if (data.hasOwnProperty(key)) {
          const errorList = data[key];
          if (Array.isArray(errorList) && errorList.length > 0) {
              return errorList[0];
          }
      }
  }
  return "sth went wrong";
}
