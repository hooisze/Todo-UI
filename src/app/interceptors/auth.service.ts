import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

let dialogOpen = false;
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  
  // const dialog = inject(MatDialog); // Use inject to get MatDialog
  
  return next(req).pipe(
    
    catchError((error) => {
      if (error.status === 403 && !dialogOpen) {
        dialogOpen = true
        console.log(error.message)
        // const dialogRef = dialog.open(UnathorizedDialogComponent, {
        //   width: '600px',
        //   data: { message: error.message },
        // });

        // dialogRef.afterClosed().subscribe(() => {
        //     dialogOpen = false; // Reset flag when dialog is closed
        //   });
      }
      return throwError(() => new Error(error.message+'from authservice'));
    })
  );
};
