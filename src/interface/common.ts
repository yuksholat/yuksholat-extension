export interface IParams {
  fajr?: number;
  imsak?: number | string;
  isha?: number | string;
  dhuhr?: number | string;
  asr?: number | string;
  highLats?: number | string;
  maghrib?: number;
  midnight?: string;
}
export interface IMethod {
  name: string;
  params: IParams;
}

export interface IMethods {
  [method: string]: IMethod;
}

export interface ITimeNames {
  [time: string]: string;
}


export interface ITimes {
  [time: string]: number;
}

export interface ITimesFormatted {
  [time: string]: string;
}

export interface ILocation {
  latitude: number;
  longitude: number;
  city: string;
}
