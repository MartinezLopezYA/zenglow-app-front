export interface CommerceConfigInterface {
  commerceconfiguuid: string;
  commerceuuid: string;
  commerceappointmentschedulepage: boolean;
  commerceappointmentapproveschedule: boolean;
  commercelandingurl: string;
  commercelandingqrcode: string;
  commercetips: boolean;
  commercedeliveryfee: boolean;
  commercedeliveryfeedefault: number;
  commercewompi: boolean,
  commercetheme: "DARK" | "LIGHT",
  commercepalette: "BLUE" | "PURPLE" | "GREEN" | "AMBAR";
  created_at: string
  updated_at: string
}


export enum ThemeEnum {
  DARK = 'DARK',
  LIGHT = 'LIGHT',
}

export enum PaletteEnum {
  BLUE = 'BLUE',
  PURPLE = 'PURPLE',
  GREEN = 'GREEN',
  AMBAR = 'AMBAR',
}

export interface ChangeStatusResponse {
  commerceconfiguuid: string;
  code: string;
  message: string;
}

export interface UpdateThemeRequest {
  commercetheme: ThemeEnum;
  commercepalette: PaletteEnum;
}
