/* eslint-disable @typescript-eslint/no-explicit-any */

type FilteredFields = {
  [key: string]: string[];
}[];
class DataFormater {
  data: any;

  // fields that you want to filter
  filteredFields: FilteredFields;

  constructor(accountData: any, filteredFields: FilteredFields) {
    this.data = accountData;
    this.filteredFields = filteredFields;
  }

  public formatData() {
    const result = this.data;
    // eslint-disable-next-line
    for (const field of this.filteredFields) {
      const [objectKey] = Object.keys(field);
      const data = this.data[objectKey];
      const filters = field[objectKey];
      let filteredData;
      if (objectKey === 'championsWithSkins' && filters.includes('ownership')) {
        const res = data
          .filter((champion: any) => champion.ownership.owned)
          .map((champion: any) => {
            const filteredSkins = champion.skins.filter(
              (skin: any) => skin.ownership.owned && !skin.isBase
            );
            return { ...champion, skins: filteredSkins };
          });
        filteredData = res;
      }

      filteredData.forEach((item: any) => {
        filters.forEach(
          (filter) => filter !== 'ownership' && delete item[filter]
        );
      });
      result[objectKey] = filteredData;
    }
    return result;
  }
}
export default DataFormater;
