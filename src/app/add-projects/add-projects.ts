import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule
  ],
  templateUrl: './add-projects.html',
  styleUrls: ['./add-projects.css']
})
export class AddProjectComponent implements OnInit {

  projectForm!: FormGroup;
  editId: string | null = null;

  managersList: any[] = [];
  employeeList: any[] = [];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      manager: [[], Validators.required],
      employees: [[], Validators.required],
      status: ['', Validators.required],
    });

    this.loadEmployees();

    this.editId = this.route.snapshot.queryParamMap.get('id');

    if (this.editId) {
      this.getProjectById(this.editId);
    }
  }

  //  LOAD EMPLOYEES
  loadEmployees() {
    this.http.get<any>('http://localhost:5000/api/employee/all')
      .subscribe({
        next: (res: any) => {
                  console.log('FULL RESPONSE:', res);


          const all = res.employees || res || [];
                  console.log('ALL EMPLOYEES:', all);

          this.managersList = [];
          this.employeeList = [];
           all.forEach((emp: any) => {
          this.managersList.unshift(emp);
          this.employeeList.unshift(emp);
        });
           console.log('MANAGERS:', this.managersList);
        console.log('EMPLOYEES:', this.employeeList);
        },
        error: () => {
          Swal.fire('Error', 'Failed to load employees', 'error');
        }
      });
  }

  //  GET PROJECT
  getProjectById(id: string) {
    this.http.get<any>(`http://localhost:5000/api/projects/${id}`)
      .subscribe({
        next: (res: any) => {
          this.projectForm.patchValue({
            name: res.name,
            description: res.description,
            category: res.category,
            manager: res.manager?.map((m: any) => m._id || m) || [],
            employees: res.employees?.map((e: any) => e._id || e) || [],
            status: res.status
          });
        },
        error: () => {
          Swal.fire('Error', 'Failed to load project', 'error');
        }
      });
  }

  //  SUBMIT
  onSubmit() {
    if (this.projectForm.invalid) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const data = this.projectForm.value;

    if (this.editId) {
      this.http.put(`http://localhost:5000/api/projects/update/${this.editId}`, data)
        .subscribe({
          next: () => this.showSuccess('Project Updated!'),
          error: () => this.showError()
        });
    } else {
      this.http.post(`http://localhost:5000/api/projects/add`, data)
        .subscribe({
          next: () => this.showSuccess('Project Added!'),
          error: () => this.showError()
        });
    }
  }

  //  SUCCESS
  showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: message,
      text: 'Saved successfully',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      this.router.navigate(['/dashboard'], {
        queryParams: { view: 'projects' }
      });
    });
  }

  //  ERROR
  showError() {
    Swal.fire('Error', 'Something went wrong', 'error');
  }

  //  BACK
  goBack() {
    this.router.navigate(['/dashboard'], {
      queryParams: { view: 'projects' }
    });
  }
}