import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class AddTaskComponent implements OnInit {

  taskForm!: FormGroup;
  editId: string | null = null;

  projects: any[] = [];
assignedByList: any[] = [];

filteredProjects: any[] = [];
  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {

    // FORM
    this.taskForm = this.fb.group({
      ticket: ['', Validators.required],
      description: ['', Validators.required],
      project: ['', Validators.required],
      shift: ['', Validators.required],
      assignedBy: ['', Validators.required],
      assignedTo: ['', Validators.required],

      effort: ['', Validators.required],
      status: ['', Validators.required]
    });

    // LOAD PROJECTS FROM API
    this.loadProjects(); 
    this.loadEmployees();   

    // EDIT MODE
    this.editId = this.route.snapshot.queryParamMap.get('id');

    if (this.editId) {
      this.getTaskById(this.editId);
    }
  }
  loadProjects() {
  this.http.get<any>('http://localhost:5000/api/projects/all')
    .subscribe({
      next: (res) => {
        this.projects = res?.projects || res?.data || res || [];
        this.filteredProjects = this.projects; // initially show all
      },
      error: () => {
        Swal.fire('Error', 'Failed to load projects', 'error');
      }
    });
}




  
/*onEmployeeChange(empId: string) {
  this.http.get<any[]>(`http://localhost:5000/api/projects/employee/${empId}`)
    .subscribe({
      next: (projects) => {
        this.filteredProjects = projects || [];

        // reset selected project
        this.taskForm.patchValue({ project: '' });
      },
      error: () => {
        this.filteredProjects = [];
      }
    });
}*/
  
 onEmployeeChange(empId: string) {

  const employee = this.assignedByList.find(e => e._id === empId);

  if (!employee || !employee.projects) {
    this.filteredProjects = this.projects;
    return;
  }

  const empProjectIds = employee.projects.map((p: any) =>
    typeof p === 'string' ? p : p._id
  );

  this.filteredProjects = this.projects.filter(p =>
    empProjectIds.includes(p._id)
  );

  // reset selected project if not valid
  const selected = this.taskForm.value.project;
  if (!empProjectIds.includes(selected)) {
    this.taskForm.patchValue({ project: '' });
  }
}
 
loadEmployees() {
  this.http.get<any>('http://localhost:5000/api/employee/all')
    .subscribe({
      next: (res) => {
        this.assignedByList = res.employees || res || [];
          
        
      },
      error: () => {
        Swal.fire('Error', 'Failed to load employees', 'error');
      }
    });
}
 

  // GET TASK BY ID
  getTaskById(id: string) {
  this.http.get<any>(`http://localhost:5000/api/tasks/${id}`)
    .subscribe({
      next: (res) => {
        this.taskForm.patchValue({
          ticket: res.ticket,
          description: res.description,
          project: res.project?._id || res.project,
          shift: res.shift,
          assignedBy: res.assignedBy?._id || res.assignedBy,
           assignedTo: res.assignedTo?._id || res.assignedTo,
          effort: res.effort
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load task', 'error');
      }
    });
}

  //  SUBMIT
 onSubmit() {

  if (this.taskForm.invalid) {
    Swal.fire('Error', 'Please fill all required fields', 'error');
    return;
  }

const formValue = this.taskForm.value;

const data = {
  ticket: formValue.ticket,
  description: formValue.description,
  project: formValue.project,        
  shift: formValue.shift,
  assignedBy: formValue.assignedBy,
  assignedTo: formValue.assignedTo,    
  effort: formValue.effort,
  status: formValue.status
};
  // UPDATE
  if (this.editId) {
    const role = (localStorage.getItem('role') || '').toLowerCase();
    this.http.put(`http://localhost:5000/api/tasks/update/${this.editId}?role=${role}`, data)
      .subscribe({
        next: () => this.showSuccess('Task Updated!'),
        error: () => this.showError()
      });
  } 

  
  // ADD
  else {
    const role = (localStorage.getItem('role') || '').toLowerCase();
    this.http.post(`http://localhost:5000/api/tasks/add?role=${role}`, data)
      .subscribe({
        next: () => this.showSuccess('Task Added!'),
        error: () => this.showError()
      });
  }
}

  // SUCCESS
  showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: message,
      text: 'Saved successfully',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      this.router.navigate(['/dashboard'], {
        queryParams: { view: 'tasks' }
      });
    });
  }

  // ERROR
  showError() {
    Swal.fire('Error', 'Something went wrong', 'error');
  }

  // BACK
  goBack() {
    this.router.navigate(['/dashboard'], {
      queryParams: { view: 'tasks' }
    });
  }
}