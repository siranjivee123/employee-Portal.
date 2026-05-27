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

  constructor(private router: Router,private http: HttpClient) {}

  ngOnInit() {
    this.loadProjects();
  }

 
// LOAD DATA:
loadProjects() {
  this.http.get<any>('http://localhost:5000/api/projects/all')
    .subscribe({
      next: (res) => {
        console.log('Projects from API:', res);

        this.projects = res.data;
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
  editProject(p: any) {
    this.router.navigate(['/add-project'], 
      { queryParams: { id: p._id }
  });
}

  //  DELETE
  deleteProject(id: string) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'This project will be deleted!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f44336',
    confirmButtonText: 'Yes, delete'
  }).then(result => {
    if (result.isConfirmed) {

      this.http.delete(`http://localhost:5000/api/projects/delete/${id}`)
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