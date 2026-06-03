import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-leave',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-leave.component.html',
  styleUrls: ['./add-leave.component.css']
})
export class AddLeaveComponent implements OnInit {

  leaveForm!: FormGroup;
  selectedFile: File | null = null;
  employeeId: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}
employees: any[] = [];
  ngOnInit() {
      const empId = localStorage.getItem('employeeId');
 if (!empId) {
    alert('Session expired. Please login again.');
    this.router.navigate(['/login']);
    return;
  } 
   this.employeeId = empId;

 console.log('Employee ID:', this.employeeId);
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      description: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    });

   this.loadEmployees();
}

loadEmployees() {
  this.http.get('http://localhost:5000/api/employees')
    .subscribe((res: any) => {
      this.employees = res;
    });
}

  //  FILE CHANGE 
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // SUBMIT WITH VALIDATION + FORM DATA
  onSubmit() {
    if (this.leaveForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    if (this.leaveForm.value.toDate < this.leaveForm.value.fromDate) {
      alert('Invalid date range');
      return;
    }

    const formData = new FormData();
    formData.append('employeeId', this.employeeId); 
    formData.append('leaveType', this.leaveForm.value.leaveType);
    formData.append('description', this.leaveForm.value.description);
    formData.append('fromDate', this.leaveForm.value.fromDate);
    formData.append('toDate', this.leaveForm.value.toDate);

    if (this.selectedFile) {
      formData.append('document', this.selectedFile);
    }

    this.http.post('http://localhost:5000/api/leave/add', formData)
      .subscribe({
        next: () => {
          alert('Leave applied successfully');
          this.resetForm();
          this.router.navigate(['/dashboard'], {
              queryParams: { view: 'leave' }
            });

        },
       error: (err) => {
  console.log('ERROR RESPONSE:', err);
  alert(err.error?.message || 'Error submitting leave');
}
      });
  }

  // RESET 
  resetForm() {
    this.leaveForm.reset();
    this.selectedFile = null;
  }
}