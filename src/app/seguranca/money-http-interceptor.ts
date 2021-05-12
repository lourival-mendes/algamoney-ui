import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { from, Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";

import { AuthService } from './auth.service';

@Injectable()
export class MoneyHttpInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!req.url.includes('/oauth/token') && this.auth.isAccessTokenInvalido()) {

      console.log('intercepatado');

      return from(this.auth.obterNovoAccessToken())
        .pipe(
          mergeMap( () => {

            console.log('obtendo novo access token');

            req = req.clone({
              setHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            return next.handle(req);

          })

      );

    }

    return next.handle(req);

  }

}
