import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Router } from '@angular/router';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    RouterModule,
    MatPaginatorModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './projects.html',
  styleUrls: ['./projects.css']
})
export class ProjectsComponent implements OnInit {

  displayedColumns: string[] = [
    'sno',
    'name',
    'description',
    'category',
    'manager',
    'employees',
    'date',
    'status',
    'actions'
  ];

  projects: any[] = [];

dataSource = new MatTableDataSource<any>([]);
   @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchText = '';
  selectedCategory = '';
  selectedDate = '';
  sortOption: string = '';

   // POPUP VARIABLES
  showPopup = false;
  selectedProject: any = null;
  isLoading = false;

  constructor(private router: Router,private http: HttpClient) {}

  
role: string = '';
userId: string = '';

ngOnInit() {
  this.role = (localStorage.getItem('role') || '').toLowerCase();
  this.userId = localStorage.getItem('employeeId') || '';

  this.loadProjects();
}
 


loadProjects() {

  this.http.get<any>(
    `http://localhost:5000/api/projects/all?role=${this.role}&userId=${this.userId}`
  )
  .subscribe({
    next: (res) => {

      this.projects = res.data || res;

        this.projects.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      this.dataSource = new MatTableDataSource(this.projects);

      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
      });

    },
    error: () => {
      Swal.fire('Error', 'Failed to load projects', 'error');
    }
  });

}

// EXPORTING CSV:
exportProjectCSV() {

  if (!this.projects || this.projects.length === 0) {
    Swal.fire('No Data', 'No projects available to export', 'warning');
    return;
  }

  this.isLoading = true;

  setTimeout(() => {

    const dataToExport = this.dataSource.filteredData.length
      ? this.dataSource.filteredData
      : this.projects;

    const csvData :any[] = dataToExport.map((p, index) => ({
      "S.No": index + 1,
      "Project Name": p.name || '',
      "Description": p.description || '',
      "Category": p.category || '',
      "Manager": p.manager?.map((m: any) => m.name).join(', ') || '',
      "Employees": p.employees?.map((e: any) => e.name).join(', ') || '',
      "Status": p.status || '',
      "Created Date": p.createdAt
        ? new Date(p.createdAt).toLocaleString()
        : ''
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvRows = [];

    csvRows.push(headers.join(','));

    csvData.forEach(row => {
      const values = headers.map(header => {
let val = (row as any)[header]?.toString() || '';
 val = val.replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'projects.csv';
    link.click();

    this.isLoading = false;

    Swal.fire('Success', 'CSV downloaded successfully!', 'success');

  }, 3000);
}
 //  FILTER & SORT
  applyFilter() {

    const keyword = this.searchText.trim().toLowerCase();
    const categoryKey = this.selectedCategory.trim().toLowerCase();

    let result = this.projects.filter(p => {

      const name = p.name?.toLowerCase() || '';
      const desc = p.description?.toLowerCase() || '';
      const category = p.category?.toLowerCase() || '';

 // SEARCH FIlter:
      const matchSearch =
        keyword === '' ||
        name.includes(keyword) ||
        desc.includes(keyword);

// CATEGORY filter
      const matchCategory =
        categoryKey === '' ||
        category.includes(categoryKey);

// DATE filter
      const matchDate =
        this.selectedDate
          ? new Date(p.date).toISOString().split('T')[0] === this.selectedDate
          : true;

      return matchSearch && matchCategory && matchDate;
    });

  // SORTING
    switch (this.sortOption) {

      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'category-asc':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;

      case 'category-desc':
        result.sort((a, b) => b.category.localeCompare(a.category));
        break;
    }
    // LATEST FIRST
if (!this.sortOption) {
  result.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}


  // APPLY DATA + PAGINATION
    this.dataSource.data = result;
  }

  //  VIEW
   viewProject(p: any) {
    this.selectedProject = p;
    this.showPopup = true;
  }

  // CLOSE POPUP
  closePopup() {
    this.showPopup = false;
  }

  // EDIT
 /* editProject(p: any) {
    this.router.navigate(['/add-project'], 
      { queryParams: { id: p._id }
  });
}*/

// EDIT

editProject(p: any) {
  if (this.role !== 'admin') {
    Swal.fire('Access Denied', 'Not allowed', 'error');
    return;
  }

  this.router.navigate(['/add-project'], { 
    queryParams: { id: p._id }
  });
}


  //  DELETE
  deleteProject(id: string) {
    
    const role = (localStorage.getItem('role') || '').toLowerCase();

      if (this.role !== 'admin') {
    Swal.fire('Access Denied', 'You are not allowed to delete', 'error');
    return;
  }
  Swal.fire({
    title: 'Are you sure?',
    text: 'This project will be deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f44336',
    confirmButtonText: 'Yes, delete'
  }).then(result => {
    if (result.isConfirmed) {

      this.http.delete(`http://localhost:5000/api/projects/delete/${id}?role=${role}`)
        .subscribe({
          next: () => {
          Swal.fire('Deleted!', 'Project removed successfully', 'success');
                        
            this.loadProjects(); 
          },
          error: () => {
            Swal.fire('Error', 'Delete failed', 'error');
          }
        });

    }
  });
}

  //  REFRESH
  refresh() {
    this.loadProjects();
  }
}