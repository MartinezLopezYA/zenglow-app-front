import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BACK_URL } from '../../../../../env';

@Service()
export class WompiService {
  private http = inject(HttpClient);
  private URL = BACK_URL;

  // getWompiConfig(): Promise<any> {}

}
