import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-success-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-success-dialog.component.html',
  styleUrls: ['./employee-success-dialog.component.css']
})
export class EmployeeSuccessDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EmployeeSuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  goToEmployee() {
    this.dialogRef.close('navigate');
  }

  close() {
    this.dialogRef.close();
  }
}