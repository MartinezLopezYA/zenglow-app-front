import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { BACK_URL } from "../../../../../env";
import { ChangeStatusResponse, CommerceConfigInterface, UpdateThemeRequest } from "../../interfaces/commerce-config.interface";
import { Observable } from "rxjs";

@Service()
export class CommerceConfigService {

  constructor() { }

  private http = inject(HttpClient);
  private URL = BACK_URL;


  getByCommerce(commerceuuid: string): Observable<CommerceConfigInterface> {
    const params = new HttpParams().set('commerceuuid', commerceuuid);
    return this.http.get<CommerceConfigInterface>(`${this.URL}/commerce-configs/v1/`, { params });
  }

  scheduleByPage(commerceuuid: string, commerceconfiguuid: string, value: boolean): Observable<ChangeStatusResponse> {
    return this.patchBoolean(commerceuuid, commerceconfiguuid, 'landing-page', value);
  }

  scheduleApproved(commerceuuid: string, commerceconfiguuid: string, value: boolean): Observable<ChangeStatusResponse> {
    return this.patchBoolean(commerceuuid, commerceconfiguuid, 'approved-schedule', value);
  }

  allowTips(commerceuuid: string, commerceconfiguuid: string, value: boolean): Observable<ChangeStatusResponse> {
    return this.patchBoolean(commerceuuid, commerceconfiguuid, 'allow-tips', value);
  }

  allowDeliveryFee(commerceuuid: string, commerceconfiguuid: string, value: boolean): Observable<ChangeStatusResponse> {
    return this.patchBoolean(commerceuuid, commerceconfiguuid, 'allow-delivery-fee', value);
  }

  updateDefaultDeliveryFee(commerceuuid: string, commerceconfiguuid: string, value: number): Observable<ChangeStatusResponse> {
    return this.http.patch<ChangeStatusResponse>(
      `${this.URL}/commerce-configs/v1/${commerceconfiguuid}/update-default-delivery-fee`,
      { value },
      {
        params: this.getCommerceParams(commerceuuid),
      },
    );
  }

  allowWompi(commerceuuid: string, commerceconfiguuid: string, value: boolean): Observable<ChangeStatusResponse> {
    return this.patchBoolean(commerceuuid, commerceconfiguuid, 'allow-wompi', value);
  }

  updateTheme(commerceuuid: string, commerceconfiguuid: string, data: UpdateThemeRequest): Observable<ChangeStatusResponse> {
    return this.http.patch<ChangeStatusResponse>(
      `${this.URL}/commerce-configs/v1/${commerceconfiguuid}/theme`,
      data,
      {
        params: this.getCommerceParams(commerceuuid),
      },
    );
  }

  private patchBoolean(commerceuuid: string, commerceconfiguuid: string, endpoint: string, value: boolean): Observable<ChangeStatusResponse> {
    return this.http.patch<ChangeStatusResponse>(
      `${this.URL}/commerce-configs/v1/${commerceconfiguuid}/${endpoint}`,
      { value },
      {
        params: this.getCommerceParams(commerceuuid),
      },
    );
  }

  private getCommerceParams(commerceuuid: string): HttpParams {
    return new HttpParams().set('commerceuuid', commerceuuid);
  }
}
