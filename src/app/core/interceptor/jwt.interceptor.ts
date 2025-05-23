// import { Injectable } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
//   HttpInterceptor,
// } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { AuthService } from '../service/authentication-service/auth.service';

// @Injectable()
// export class JwtInterceptor implements HttpInterceptor {
//   constructor(private authenticationService: AuthService) {}

//   intercept(
//     request: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     // add authorization header with jwt token if available
//     let currentUser = this.authenticationService.currentUserAffiliateValue;
//     if (currentUser && currentUser.token) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `Bearer ${currentUser.token}`,
//         },
//       });
//     }

//     return next.handle(request);
//   }
// }
