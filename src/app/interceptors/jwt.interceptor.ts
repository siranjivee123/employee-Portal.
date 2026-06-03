import { HttpInterceptorFn } from '@angular/common/http';

// export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

//   const token = localStorage.getItem('token');

//    console.log("INTERCEPTOR TOKEN:", token);

//   if (token) {
//     const clonedReq = req.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     return next(clonedReq);
//   }

//   return next(req);
// };

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};