import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './employee-list.html',
  styleUrls: ['./employee-list.css']
})
export class EmployeeListComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['sno', 'profileImage', 'id', 'name', 'projects', 'tasks', 'email', 'date', 'actions'];
  
  employees: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  paginatedData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // FILTERS
  searchText = '';
  selectedProject = '';
  selectedDate = '';
  sortOption = '';

  // USER AUTH INFO
  role: string = '';
  loggedInEmployeeId: string = '';

  // POPUP
  showPopup = false;
  selectedEmployee: any = null;
  //HOVERED IMAGE:
  hoveredEmp: string | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.getUserDetails();
  }

  ngOnInit(): void {
    this.loadEmployees();
  }
  // IMAGE UPLOAD:
onImageChange(event: any, emp: any) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('profileImage', file);

  this.http.put(
    `http://localhost:5000/api/employee/${emp._id}/profile-image`,
    formData
  ).subscribe({
    next: (res: any) => {

      //  update employees array
      const index = this.employees.findIndex(e => e._id === emp._id);
      if (index !== -1) {
        this.employees[index].profileImage = res.profileImage;
      }

      //   datasource 
      this.dataSource.data = [...this.employees];

      //  updatpaginated view
      this.updatePagedData();

      //  Angular refresh 
      this.dataSource._updateChangeSubscription();
    },

    error: (err) => {
      console.error('Image upload failed', err);
    }
  });
}
  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.updatePagedData();

      this.paginator.page.subscribe(() => {
        this.updatePagedData();
      });
    }
  }

  getUserDetails() {
    this.role = (localStorage.getItem('role') || '').toLowerCase();
    this.loggedInEmployeeId = localStorage.getItem('employeeId') || '';
  }

  updatePagedData() {
    if (!this.paginator) {
      this.paginatedData = this.dataSource.data;
      return;
    }
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    this.paginatedData = this.dataSource.data.slice(startIndex, endIndex);
  }

  loadEmployees() {
    this.http.get<any>('http://localhost:5000/api/employee/all')
      .subscribe({
        next: (res) => {
          let data = res.employees || [];

          //  Filter list  if  user is an employee
          if (this.role === 'employee') {
            data = data.filter((emp: any) => emp._id === this.loggedInEmployeeId);
          }

          this.employees = data;
          this.dataSource.data = data;
          this.updatePagedData();
        },
        error: (err) => {
          console.error('Failed to load employee directory contextual information:', err);
        }
      });
  }

  applyFilter() {
    const keyword = this.searchText.trim().toLowerCase();
    const projectKey = this.selectedProject.trim().toLowerCase();

    let result = this.employees.filter(emp => {
      const name = emp.name?.toLowerCase() || '';
      const email = emp.email?.toLowerCase() || '';

      const matchSearch = !keyword || name.includes(keyword) || email.includes(keyword);

      const projects = Array.isArray(emp.projects)
        ? emp.projects
        : emp.projects ? [emp.projects] : [];

      const matchProject = !projectKey || projects.some((p: any) => {
        const pName = p?.name || p;
        return pName.toLowerCase().includes(projectKey);
      });

      const matchDate = !this.selectedDate || 
        new Date(emp.createdAt).toISOString().split('T')[0] === this.selectedDate;

      return matchSearch && matchProject && matchDate;
    });

    // SORTING 
    switch (this.sortOption) {
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'project-asc':
        result.sort((a, b) => {
          const aProj = Array.isArray(a.projects) ? (a.projects[0]?.name || a.projects[0] || '') : (a.projects?.name || a.projects || '');
          const bProj = Array.isArray(b.projects) ? (b.projects[0]?.name || b.projects[0] || '') : (b.projects?.name || b.projects || '');
          return aProj.localeCompare(bProj);
        });
        break;
      case 'project-desc':
        result.sort((a, b) => {
          const aProj = Array.isArray(a.projects) ? (a.projects[0]?.name || a.projects[0] || '') : (a.projects?.name || a.projects || '');
          const bProj = Array.isArray(b.projects) ? (b.projects[0]?.name || b.projects[0] || '') : (b.projects?.name || b.projects || '');
          return bProj.localeCompare(aProj);
        });
        break;
    }

    this.dataSource.data = result;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.updatePagedData();
  }

  getProjectNames(emp: any): string {
    if (!emp?.projects || emp.projects.length === 0) return 'NA';
    return emp.projects.map((p: any) => p?.name || p).filter(Boolean).join(', ');
  }

  getTaskTickets(emp: any): string {
    if (!emp?.tasks || emp.tasks.length === 0) return 'NA';
    return emp.tasks.map((t: any) => `${t.ticket || t.title || 'Task'} (${t.status || 'Pending'})`).join(', ');
  }

  viewEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.selectedEmployee = null;
  }

  editEmployee(emp: any) {
    if (this.role !== 'admin') return;
    this.router.navigate(['/add-employee'], { queryParams: { id: emp._id } });
  }

 deleteEmployee(id: string) {
  if (this.role !== 'admin') return;

  Swal.fire({
    title: 'Are you sure?',
    text: 'This Employee will be permanently deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {

      this.http.delete(`http://localhost:5000/api/employee/delete/${id}?role=${this.role}`)
        .subscribe({
          next: () => {
            this.loadEmployees();

            Swal.fire(
              'Deleted!',
              'Employee deleted successfully',
              'success'
            );
          },
          error: () => {
            Swal.fire(
              'Error!',
              'Failed to delete employee',
              'error'
            );
          }
        });

    }
  });
 }
}