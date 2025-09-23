import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { inject } from '@angular/core';

/**
 * HTTP interceptor to add an API key header and show a loading spinner during requests.
 *
 * Dependencies:
 * - NgxSpinnerService: To show and hide the loading spinner.
 * - environment.apiKey: Used to attach the API key in the request headers.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The next handler in the HTTP request pipeline.
 * @returns An observable of the HTTP event stream.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(NgxSpinnerService);
  spinner.show();
  const clonedRequest = req.clone({
    setHeaders: {
      'API_KEY': environment.apiKey
    }
  });
  return next(clonedRequest).pipe(finalize(() => {
    setTimeout(() => {
      spinner.hide();
    }, 500);
  }));
};
