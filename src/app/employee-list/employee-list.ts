
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

  // TABLE 
  displayedColumns: string[] = [
    'sno',
    'profileImage',
    'id',
    'name',
    'projects',
    'tasks',
    'email',
    'date',
    'actions'
  ];

  employees: any[] = [];
  dataSource = new MatTableDataSource<any>([]);

  //  PAGINATION ARRAY
  paginatedData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // FILTERS
  searchText = '';
  selectedProject = '';
  selectedDate = '';
  sortOption = '';

  // ROLE
  role: string = '';

  // POPUP
  showPopup = false;
  selectedEmployee: any = null;
hoveredEmp: string | null = null;
  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.getRoleFromToken();
  }

  // INIT
  ngOnInit(): void {
    this.loadEmployees();
  }
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

      // ON PAGE CHANGE
      this.paginator.page.subscribe(() => {
        this.updatePagedData();
      });
    }
  }

  // ROLE
  getRoleFromToken() {
    this.role = (localStorage.getItem('role') || '').toLowerCase();
  }
  //  PAGINATION 
  updatePagedData() {
    if (!this.paginator) {
      this.paginatedData = this.dataSource.data;
      return;
    }

    const startIndex =
      this.paginator.pageIndex * this.paginator.pageSize;

    const endIndex = startIndex + this.paginator.pageSize;

    this.paginatedData = this.dataSource.data.slice(startIndex, endIndex);

    console.log("PAGED DATA:", this.paginatedData);
  }

  // LOAD DATA
  loadEmployees() {
    this.http.get<any>('http://localhost:5000/api/employee/all')
      .subscribe({
        next: (res) => {
          console.log('API DATA:', res);

          const data = res.employees || [];

          this.employees = data;
          this.dataSource.data = data;

        
          this.updatePagedData();

          console.log("FINAL ARRAY:", this.dataSource.data);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  // FILTER + SORT
  applyFilter() {

    const keyword = this.searchText.trim().toLowerCase();
    const projectKey = this.selectedProject.trim().toLowerCase();

    let result = this.employees.filter(emp => {

      const name = emp.name?.toLowerCase() || '';
      const email = emp.email?.toLowerCase() || '';

      const matchSearch =
        !keyword ||
        name.includes(keyword) ||
        email.includes(keyword);

      const projects = Array.isArray(emp.projects)
        ? emp.projects
        : emp.projects
          ? [emp.projects]
          : [];

      const matchProject =
        !projectKey ||
        projects.some((p: string) =>
          p.toLowerCase().includes(projectKey)
        );

      const matchDate =
        !this.selectedDate ||
        new Date(emp.createdAt).toISOString().split('T')[0] === this.selectedDate;

      return matchSearch && matchProject && matchDate;
    });

    // SORT
    switch (this.sortOption) {

      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;

      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;

      case 'project-asc':
        result.sort((a, b) => {
          const aProj = Array.isArray(a.projects) ? a.projects[0] : a.projects || '';
          const bProj = Array.isArray(b.projects) ? b.projects[0] : b.projects || '';
          return aProj.localeCompare(bProj);
        });
        break;

      case 'project-desc':
        result.sort((a, b) => {
          const aProj = Array.isArray(a.projects) ? a.projects[0] : a.projects || '';
          const bProj = Array.isArray(b.projects) ? b.projects[0] : b.projects || '';
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
  //  FUNCTIONS
getImageUrl(emp: any) {
  if (!emp.profileImage) {
    return 'assets/default-user.png';
  }

  return `http://localhost:5000/${emp.profileImage}`;
}
getProjectNames(emp: any): string {
  return (emp.projects || [])
    .map((p: any) => p?.name)
    .join(', ');
}

getTaskTickets(emp: any): string {
  return (emp.tasks || [])
    .map((t: any) => t?.ticket)
    .join(', ');
}

getManagerNames(emp: any): string {
  return (emp.managers || [])
    .map((m: any) => m?.name)
    .join(', ');
}

  // VIEW
  viewEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  // EDIT
  editEmployee(emp: any) {
    if (this.role !== 'admin') return;

    this.router.navigate(['/add-employee'], {
      queryParams: { id: emp._id }
    });
  }

  // DELETE
  deleteEmployee(id: string) {

    if (this.role !== 'admin') return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'This Employee will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      confirmButtonText: 'Yes, delete'
    }).then(result => {

      if (result.isConfirmed) {

        this.http.delete(`http://localhost:5000/api/employee/delete/${id}`)
          .subscribe( {
            next: ()=> {
                this.employees = this.employees.filter(emp => emp._id !== id);

            // DATASOURCE
            this.dataSource.data = this.employees;

            //  UPDATE PAGINATION
            this.updatePagedData();



            Swal.fire(
              'Deleted!',
              'Employee removed successfully',
              'success'
            );
          },
          error: () => {
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });
      }
    });
  }

  // REFRESH
  refresh() {
    this.loadEmployees();
  }
}

